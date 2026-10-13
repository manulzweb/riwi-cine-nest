// src/pages/BookingPage.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { Reservation, SeatItem, ShowtimeSeatMapResponse } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { SeatMap } from '../components/SeatMap.tsx';
import { ReservationTimer } from '../components/ReservationTimer.tsx';
import { TicketSummary } from '../components/TicketSummary.tsx';

interface BookingPageProps {
  showtimeId: number;
  onBack: () => void;
  onViewMyReservations: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  showtimeId,
  onBack,
  onViewMyReservations,
}) => {
  const { user, openAuthModal } = useAuth();
  const { notify } = useNotification();

  const [seatMapData, setSeatMapData] = useState<ShowtimeSeatMapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Polling interval reference
  const pollIntervalRef = useRef<any>(null);

  const fetchSeatMap = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      try {
        const data = await api.getFunctionSeats(showtimeId);
        setSeatMapData(data);

        // Si alguna de las butacas que el usuario estaba seleccionando fue tomada por otro, deseleccionarla
        if (!activeReservation) {
          setSelectedSeatIds((prev) => {
            const stillAvailable = prev.filter((id) => {
              const seat = data.seats.find((s) => s.id === id);
              return seat && seat.status === 'AVAILABLE';
            });
            if (stillAvailable.length < prev.length) {
              notify(
                'Una de las butacas que habías seleccionado acaba de ser tomada por otro cliente.',
                'error',
              );
            }
            return stillAvailable;
          });
        }
      } catch (err: any) {
        if (!isBackground) {
          notify(err.message || 'Error al cargar mapa de la sala', 'error');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showtimeId, activeReservation, notify],
  );

  useEffect(() => {
    fetchSeatMap();

    // Iniciar polling en tiempo real cada 5 segundos
    pollIntervalRef.current = setInterval(() => {
      fetchSeatMap(true);
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [fetchSeatMap]);

  const handleToggleSeat = (seat: SeatItem) => {
    if (activeReservation) return; // Ya bloqueados
    setSelectedSeatIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id],
    );
  };

  // Calcular subtotal de las butacas seleccionadas
  const selectedSeats = React.useMemo(() => {
    if (!seatMapData) return [];
    return seatMapData.seats.filter((s) => selectedSeatIds.includes(s.id));
  }, [seatMapData, selectedSeatIds]);

  const totalAmount = React.useMemo(() => {
    return selectedSeats.reduce((acc, s) => acc + s.price, 0);
  }, [selectedSeats]);

  // Acción 1: Bloquear butacas (Crear reserva temporal con TTL)
  const handleLockSeats = async () => {
    if (!user) {
      notify('Por favor, inicia sesión para reservar tus butacas', 'info');
      openAuthModal('login');
      return;
    }

    if (selectedSeatIds.length === 0) {
      notify('Selecciona al menos una butaca disponible en el mapa', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createReservation({
        functionId: showtimeId,
        seatIds: selectedSeatIds,
      });
      setActiveReservation(res);
      notify('¡Butacas bloqueadas con éxito! Tienes 10 minutos para confirmar.', 'success');
      await fetchSeatMap(true);
    } catch (err: any) {
      notify(err.message || 'Error al bloquear las butacas', 'error');
      await fetchSeatMap(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Acción 2: Confirmar reserva definitiva
  const handleConfirmReservation = async () => {
    if (!activeReservation) return;

    setSubmitting(true);
    try {
      const confirmed = await api.confirmReservation(activeReservation.id);
      setActiveReservation(confirmed);
      setIsConfirmed(true);
      notify('¡Reserva confirmada exitosamente! Disfruta tu película.', 'success');
      await fetchSeatMap(true);
    } catch (err: any) {
      notify(err.message || 'Error al confirmar la reserva', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Acción 3: Cancelar y liberar asientos
  const handleCancelReservation = async () => {
    if (!activeReservation) return;

    setSubmitting(true);
    try {
      await api.cancelReservation(activeReservation.id);
      setActiveReservation(null);
      setSelectedSeatIds([]);
      notify('Reserva cancelada y butacas liberadas.', 'info');
      await fetchSeatMap(true);
    } catch (err: any) {
      notify(err.message || 'Error al cancelar la reserva', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimerExpire = () => {
    notify('El tiempo de bloqueo ha expirado. Las butacas han sido liberadas.', 'error');
    setActiveReservation(null);
    setSelectedSeatIds([]);
    fetchSeatMap(true);
  };

  if (loading) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-12 h-12 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Cargando disponibilidad de la sala...</span>
      </div>
    );
  }

  if (!seatMapData) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="text-red-400 font-semibold mb-4">No se pudo cargar la función seleccionada.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition"
        >
          Volver a Cartelera
        </button>
      </div>
    );
  }

  // Vista cuando ya está confirmada la reserva
  if (isConfirmed && activeReservation) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">¡Reserva Completada con Éxito!</h1>
          <p className="text-slate-400 text-sm">
            Tus entradas han sido emitidas. Presenta este comprobante al ingresar a la sala.
          </p>
        </div>

        <TicketSummary reservation={activeReservation} onClose={onViewMyReservations} />
      </div>
    );
  }

  const formattedDate = seatMapData.startTime
    ? new Date(seatMapData.startTime).toLocaleDateString('es-CO', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar with back button and real-time status */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cinema-card hover:bg-slate-800 text-slate-300 hover:text-white border border-cinema-border transition text-sm font-semibold focus-visible:ring-2 focus-visible:ring-cinema-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Cartelera
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span>Sincronización en Tiempo Real</span>
          {refreshing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
        </div>
      </div>

      {/* Showtime Banner */}
      <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 mb-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-extrabold block mb-1">
            Selección de Butacas
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{seatMapData.movieTitle}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cinema-accent" />
              {seatMapData.cinemaName} • {seatMapData.roomName}
            </span>
            <span className="flex items-center gap-1.5 capitalize">
              <Calendar className="w-4 h-4 text-cinema-accent" />
              {formattedDate}
            </span>
            <span className="text-emerald-400 font-semibold">
              {seatMapData.availableSeats} butacas libres
            </span>
          </div>
        </div>

        {/* Price & Summary */}
        <div className="flex items-center gap-6 bg-cinema-dark/80 p-4 rounded-xl border border-cinema-border">
          <div>
            <span className="block text-[11px] text-slate-400 font-medium">Tarifa Base:</span>
            <span className="text-lg font-bold text-white font-mono">
              ${seatMapData.basePrice.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="pl-6 border-l border-cinema-border">
            <span className="block text-[11px] text-slate-400 font-medium">Seleccionadas:</span>
            <span className="text-lg font-bold text-cinema-accent font-mono">
              {selectedSeatIds.length} butaca{selectedSeatIds.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main interactive area: Seat Map and Summary Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Seat Map */}
        <div className="lg:col-span-2 bg-cinema-card/50 border border-cinema-border rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <SeatMap
            seats={seatMapData.seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
            disabled={!!activeReservation || submitting}
          />
        </div>

        {/* Right Col: Reservation summary and actions */}
        <div className="space-y-6">
          {/* Reservation Countdown Timer when active */}
          {activeReservation && activeReservation.expiresAt && (
            <ReservationTimer
              expiresAt={activeReservation.expiresAt}
              onExpire={handleTimerExpire}
            />
          )}

          {/* Selection card */}
          <div className="bg-cinema-card border border-cinema-border rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-cinema-accent" />
              Resumen de Compra
            </h2>

            {selectedSeats.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed italic">
                Haz clic en una o más butacas del mapa para agregarlas a tu reserva.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {selectedSeats.map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-cinema-dark border border-cinema-border"
                    >
                      <div>
                        <span className="font-bold text-white">Butaca {seat.seatNumber}</span>
                        <span className="text-slate-400 ml-1.5">({seat.seatType})</span>
                      </div>
                      <span className="font-mono font-bold text-slate-200">
                        ${seat.price.toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-cinema-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">Total a Pagar:</span>
                  <span className="text-xl font-black text-white font-mono">
                    ${totalAmount.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons depending on state */}
            {!activeReservation ? (
              <button
                type="button"
                onClick={handleLockSeats}
                disabled={selectedSeatIds.length === 0 || submitting}
                className="w-full py-3 px-4 bg-cinema-accent hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-glow transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Bloquear y Continuar
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg transition disabled:opacity-40 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar Compra
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelReservation}
                  disabled={submitting}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 font-semibold text-xs rounded-xl border border-slate-700 transition"
                >
                  Cancelar y Liberar Butacas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
