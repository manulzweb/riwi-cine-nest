// src/components/SeatMap.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Armchair, Check, Clock, Lock, Sparkles, UserCheck } from 'lucide-react';
import { SeatItem } from '../types/index.ts';

interface SeatMapProps {
  seats: SeatItem[];
  selectedSeatIds: number[];
  onToggleSeat: (seat: SeatItem) => void;
  maxSelection?: number;
  disabled?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  maxSelection = 8,
  disabled = false,
}) => {
  const [liveMessage, setLiveMessage] = useState<string>('');

  // Group seats by row
  const rowsMap = useMemo(() => {
    const map = new Map<string, SeatItem[]>();
    for (const seat of seats) {
      if (!map.has(seat.row)) {
        map.set(seat.row, []);
      }
      map.get(seat.row)!.push(seat);
    }
    // Sort rows alphabetically
    const sortedKeys = Array.from(map.keys()).sort();
    return sortedKeys.map((key) => ({
      row: key,
      seats: map.get(key)!.sort((a, b) => a.number - b.number),
    }));
  }, [seats]);

  const handleSeatClick = useCallback(
    (seat: SeatItem) => {
      if (disabled) return;
      if (seat.status === 'SOLD') {
        setLiveMessage(`La butaca ${seat.seatNumber} ya ha sido vendida.`);
        return;
      }
      if (seat.status === 'LOCKED' && !seat.isMine) {
        setLiveMessage(`La butaca ${seat.seatNumber} está actualmente bloqueada por otro usuario.`);
        return;
      }

      const isSelected = selectedSeatIds.includes(seat.id);

      if (!isSelected && selectedSeatIds.length >= maxSelection) {
        setLiveMessage(`Límite alcanzado: máximo ${maxSelection} butacas por reserva.`);
        return;
      }

      onToggleSeat(seat);

      if (isSelected) {
        setLiveMessage(`Deseleccionaste la butaca ${seat.seatNumber}.`);
      } else {
        setLiveMessage(
          `Seleccionaste la butaca ${seat.seatNumber}, tipo ${seat.seatType}, valor $${seat.price.toLocaleString('es-CO')} COP.`,
        );
      }
    },
    [disabled, selectedSeatIds, maxSelection, onToggleSeat],
  );

  // Keyboard navigation support for ARIA grid / list
  const handleKeyDown = (e: React.KeyboardEvent, seat: SeatItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSeatClick(seat);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {/* Screen Representation */}
      <div className="w-full max-w-2xl mb-10 flex flex-col items-center">
        <div className="w-5/6 h-3 bg-gradient-to-r from-cyan-500/20 via-cyan-400 to-cyan-500/20 rounded-full cinema-screen mb-2" />
        <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          PANTALLA
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 p-3 rounded-xl bg-cinema-dark/80 border border-cinema-border text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400">
            <Armchair className="w-4 h-4" />
          </div>
          <span className="text-slate-300">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cinema-accent border border-red-500 flex items-center justify-center text-white shadow-glow">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-white font-medium">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-slate-400">Bloqueado (En proceso)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-slate-500">Ocupado / Vendido</span>
        </div>
        <div className="flex items-center gap-2 pl-2 border-l border-cinema-border">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-slate-400">Preferencial / VIP</span>
        </div>
      </div>

      {/* Seats Matrix */}
      <div
        className="w-full max-w-3xl overflow-x-auto p-4 flex flex-col items-center gap-3"
        role="region"
        aria-label="Mapa de asientos de la sala"
      >
        {rowsMap.map(({ row, seats: rowSeats }) => (
          <div key={row} className="flex items-center gap-2 sm:gap-3" role="row">
            {/* Row Identifier */}
            <span
              className="w-6 text-center font-bold text-slate-400 text-sm select-none"
              aria-label={`Fila ${row}`}
            >
              {row}
            </span>

            {/* Seats in Row */}
            <div className="flex items-center gap-2 sm:gap-3">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.id);
                const isSold = seat.status === 'SOLD';
                const isLockedByOther = seat.status === 'LOCKED' && !seat.isMine;
                const isLockedByMe = seat.status === 'LOCKED' && seat.isMine;
                const isPreferential = seat.seatType.toLowerCase().includes('pref') || seat.seatType.toLowerCase().includes('vip');

                let statusLabel = 'Disponible';
                if (isSelected) statusLabel = 'Seleccionada por ti';
                else if (isLockedByMe) statusLabel = 'Bloqueada en tu reserva';
                else if (isLockedByOther) statusLabel = 'Bloqueada por otro cliente';
                else if (isSold) statusLabel = 'Vendida';

                const ariaLabel = `Butaca ${seat.seatNumber}, Tipo ${seat.seatType}, Valor $${seat.price.toLocaleString('es-CO')} COP, ${statusLabel}`;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={disabled || isSold || isLockedByOther}
                    onClick={() => handleSeatClick(seat)}
                    onKeyDown={(e) => handleKeyDown(e, seat)}
                    aria-label={ariaLabel}
                    aria-pressed={isSelected}
                    className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-150 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cinema-accent ${
                      isSelected
                        ? 'bg-cinema-accent text-white border-2 border-red-400 shadow-glow scale-105 z-10'
                        : isLockedByMe
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500'
                        : isLockedByOther
                        ? 'bg-amber-950/40 text-amber-500/50 border border-amber-900/40 cursor-not-allowed opacity-60'
                        : isSold
                        ? 'bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-40'
                        : isPreferential
                        ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 hover:scale-105'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:scale-105'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" aria-hidden="true" />
                    ) : isLockedByMe ? (
                      <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" aria-hidden="true" />
                    ) : isLockedByOther ? (
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                    ) : isSold ? (
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                    ) : (
                      <span>{seat.number}</span>
                    )}

                    {/* VIP / Preferential indicator dot */}
                    {isPreferential && !isSelected && !isSold && !isLockedByOther && (
                      <span
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900"
                        title="Asiento Preferencial"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Row Identifier (Right mirror) */}
            <span
              className="w-6 text-center font-bold text-slate-400 text-sm select-none"
              aria-hidden="true"
            >
              {row}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
