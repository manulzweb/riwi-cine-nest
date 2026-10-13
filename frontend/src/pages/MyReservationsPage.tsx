// src/pages/MyReservationsPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Film,
  MapPin,
  RefreshCw,
  Ticket,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Reservation } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { TicketSummary } from '../components/TicketSummary.tsx';

interface MyReservationsPageProps {
  onGoToBillboard: () => void;
}

export const MyReservationsPage: React.FC<MyReservationsPageProps> = ({
  onGoToBillboard,
}) => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Reservation | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyReservations();
      setReservations(data);
    } catch (err: any) {
      notify(err.message || 'Error al cargar reservas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleConfirm = async (id: number) => {
    setActionLoadingId(id);
    try {
      const confirmed = await api.confirmReservation(id);
      notify('¡Reserva confirmada con éxito!', 'success');
      setSelectedTicket(confirmed);
      await fetchReservations();
    } catch (err: any) {
      notify(err.message || 'Error al confirmar', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    setActionLoadingId(id);
    try {
      await api.cancelReservation(id);
      notify('Reserva cancelada y butacas liberadas.', 'info');
      await fetchReservations();
    } catch (err: any) {
      notify(err.message || 'Error al cancelar', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <Ticket className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Inicia sesión</h2>
        <p className="text-slate-400 text-sm mb-6">
          Debes estar autenticado para consultar tu historial de reservas y boletos.
        </p>
        <button
          type="button"
          onClick={onGoToBillboard}
          className="px-5 py-2.5 bg-cinema-accent text-white font-bold rounded-xl shadow-glow"
        >
          Ir a Cartelera
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-cinema-accent" />
            Mis Reservas y Boletos
          </h1>
          <p className="text-slate-400 text-sm">
            Consulta el estado de tus reservas activas y descarga tus comprobantes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReservations}
          className="p-2.5 rounded-xl bg-cinema-card border border-cinema-border hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
          <div className="w-10 h-10 border-4 border-cinema-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando tus reservas...</span>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-cinema-card border border-cinema-border rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Aún no tienes reservas</h2>
          <p className="text-slate-400 text-sm mb-6">
            Explora la cartelera y reserva tus butacas favoritas en tiempo real.
          </p>
          <button
            type="button"
            onClick={onGoToBillboard}
            className="px-5 py-2.5 bg-cinema-accent hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-glow transition"
          >
            Ver Películas Disponibles
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => {
            const isConfirmed = res.status === 'CONFIRMED';
            const isActive = res.status === 'ACTIVE';
            const isExpired = res.status === 'EXPIRED';

            const formattedTime = res.startTime
              ? new Date(res.startTime).toLocaleDateString('es-CO', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Horario por confirmar';

            return (
              <div
                key={res.id}
                className="bg-cinema-card border border-cinema-border rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-slate-600 transition"
              >
                {/* Movie & Showtime info */}
                <div className="flex gap-4 items-center">
                  {res.moviePoster ? (
                    <img
                      src={res.moviePoster}
                      alt={res.movieTitle || 'Película'}
                      className="w-16 h-22 object-cover rounded-xl border border-cinema-border shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-22 bg-cinema-dark rounded-xl border border-cinema-border flex items-center justify-center text-slate-600 shrink-0">
                      <Film className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-white leading-tight">
                        {res.movieTitle || 'Película'}
                      </h2>
                      {res.format && (
                        <span className="px-1.5 py-0.5 bg-cyan-950/70 border border-cyan-800 text-cyan-300 rounded text-[10px] font-extrabold">
                          {res.format}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{res.cinemaName} • {res.roomName}</span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5 capitalize">
                      <Calendar className="w-3.5 h-3.5 text-cinema-accent" />
                      <span>{formattedTime}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {res.seats?.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 bg-cinema-dark border border-cinema-border rounded text-[11px] font-mono text-slate-300"
                        >
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status, total, and Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-cinema-border">
                  <div className="text-left sm:text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isActive
                          ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isConfirmed && <CheckCircle2 className="w-3 h-3" />}
                      {isActive && <Clock className="w-3 h-3" />}
                      {isExpired && <XCircle className="w-3 h-3" />}
                      {res.status}
                    </span>
                    <span className="block text-base font-black text-white font-mono mt-1">
                      ${(res.totalAmount || 0).toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(res)}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-600 transition"
                      >
                        Ver Boleta
                      </button>
                    )}

                    {isActive && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === res.id}
                          onClick={() => handleConfirm(res.id)}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === res.id}
                          onClick={() => handleCancel(res.id)}
                          className="p-1.5 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-xl border border-slate-700 transition"
                          title="Cancelar y liberar"
                          aria-label="Cancelar reserva"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <TicketSummary reservation={selectedTicket} onClose={() => setSelectedTicket(null)} />
          </div>
        </div>
      )}
    </div>
  );
};
