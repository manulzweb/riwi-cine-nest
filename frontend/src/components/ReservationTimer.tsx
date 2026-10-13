// src/components/ReservationTimer.tsx

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface ReservationTimerProps {
  expiresAt: string;
  onExpire: () => void;
}

export const ReservationTimer: React.FC<ReservationTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        onExpire();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft > 0 && timeLeft <= 120; // Menos de 2 minutos

  const totalDuration = 10 * 60; // 10m
  const percentage = Math.min(100, Math.max(0, (timeLeft / totalDuration) * 100));

  return (
    <div
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
      className={`p-4 rounded-xl border backdrop-blur-md transition-all flex flex-col gap-2 ${
        isUrgent
          ? 'bg-amber-950/40 border-amber-600/60 text-amber-200 animate-pulse'
          : 'bg-cinema-card border-cinema-border text-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
          ) : (
            <Clock className="w-5 h-5 text-cyan-400 shrink-0" aria-hidden="true" />
          )}
          <span className="text-sm font-semibold">
            {isUrgent ? '¡Tiempo a punto de expirar!' : 'Tus butacas están reservadas'}
          </span>
        </div>
        <div className="text-lg font-mono font-bold text-white bg-cinema-dark px-3 py-1 rounded-lg border border-cinema-border">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full bg-cinema-dark rounded-full h-2 overflow-hidden border border-cinema-border"
        role="progressbar"
        aria-valuenow={timeLeft}
        aria-valuemin={0}
        aria-valuemax={totalDuration}
        aria-label="Tiempo restante de reserva"
      >
        <div
          className={`h-full transition-all duration-1000 rounded-full ${
            isUrgent ? 'bg-amber-500' : 'bg-cinema-accent'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-slate-400">
        Completa tu confirmación antes de que expire el contador para asegurar tus entradas.
      </p>
    </div>
  );
};
