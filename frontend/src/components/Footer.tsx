// src/components/Footer.tsx

import React from 'react';
import { Film, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-cinema-dark border-t border-cinema-border py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cinema-accent flex items-center justify-center text-white">
            <Film className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-wider">RIWI CINE</span>
            <p className="text-xs text-slate-500">Plataforma Multicine de Alta Rendimiento & Reserva Concurrente</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Sesiones Protegidas HttpOnly & CSRF
          </span>
          <span>API REST /api/v1</span>
          <span>© 2026 Riwi Cine. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
};
