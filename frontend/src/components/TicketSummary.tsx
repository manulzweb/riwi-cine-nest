// src/components/TicketSummary.tsx

import React from 'react';
import { Calendar, Film, MapPin, Printer, QrCode, Ticket } from 'lucide-react';
import { Reservation } from '../types/index.ts';

interface TicketSummaryProps {
  reservation: Reservation;
  onClose?: () => void;
}

export const TicketSummary: React.FC<TicketSummaryProps> = ({ reservation, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = reservation.startTime
    ? new Date(reservation.startTime).toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Horario por confirmar';

  return (
    <div className="w-full max-w-lg mx-auto bg-cinema-card border border-cinema-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative Ticket Perforation Effects */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cinema-dark border-r border-cinema-border pointer-events-none" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cinema-dark border-l border-cinema-border pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-dashed border-cinema-border mb-5">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-cinema-accent" aria-hidden="true" />
          <span className="font-bold text-sm tracking-wider uppercase text-white">Comprobante de Entrada</span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            reservation.status === 'CONFIRMED'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : reservation.status === 'ACTIVE'
              ? 'bg-amber-950 text-amber-400 border border-amber-800'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {reservation.status === 'CONFIRMED' ? 'Confirmada' : reservation.status}
        </span>
      </div>

      {/* Movie & Showtime Details */}
      <div className="flex gap-4 mb-5">
        {reservation.moviePoster ? (
          <img
            src={reservation.moviePoster}
            alt={`Póster de ${reservation.movieTitle || 'Película'}`}
            className="w-20 h-28 object-cover rounded-xl border border-cinema-border shadow-md shrink-0"
          />
        ) : (
          <div className="w-20 h-28 bg-cinema-dark rounded-xl border border-cinema-border flex items-center justify-center text-slate-600 shrink-0">
            <Film className="w-8 h-8" />
          </div>
        )}

        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-bold text-white leading-tight mb-1">
            {reservation.movieTitle || 'Película Riwi Cine'}
          </h3>
          {reservation.format && (
            <span className="inline-block self-start px-2 py-0.5 mb-2 bg-cinema-accent/20 text-cinema-accent border border-cinema-accent/30 rounded text-xs font-semibold">
              {reservation.format}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{reservation.cinemaName} • {reservation.roomName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 capitalize">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Seats Badges */}
      <div className="bg-cinema-dark p-3 rounded-xl border border-cinema-border mb-5">
        <span className="block text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">
          Butacas Reservadas ({reservation.seats?.length || 0}):
        </span>
        <div className="flex flex-wrap gap-2">
          {reservation.seats?.map((seat) => (
            <span
              key={seat.id}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-bold"
            >
              {seat.seatNumber || `${seat.row}${seat.number}`} {seat.seatType && `(${seat.seatType})`}
            </span>
          ))}
        </div>
      </div>

      {/* Financial Total & QR Mockup */}
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-cinema-border mb-6">
        <div>
          <span className="block text-xs text-slate-400">Total Pagado:</span>
          <span className="text-xl font-black text-white font-mono">
            ${(reservation.totalAmount || 0).toLocaleString('es-CO')} COP
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl text-black shadow-inner">
          <QrCode className="w-10 h-10" aria-label="Código QR de verificación para acceso a sala" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-600 transition flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-cinema-accent"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-cinema-accent hover:bg-red-700 text-white font-semibold rounded-xl transition shadow-glow focus-visible:ring-2 focus-visible:ring-white"
          >
            Listo
          </button>
        )}
      </div>
    </div>
  );
};
