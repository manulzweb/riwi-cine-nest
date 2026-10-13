// src/components/Navbar.tsx

import React, { useState } from 'react';
import { Film, LogIn, LogOut, MapPin, Menu, Ticket, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { City } from '../types/index.ts';

interface NavbarProps {
  cities: City[];
  selectedCityId: number | null;
  onSelectCity: (cityId: number | null) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cities,
  selectedCityId,
  onSelectCity,
  currentPage,
  onNavigate,
}) => {
  const { user, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-cinema-dark/90 backdrop-blur-md border-b border-cinema-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => onNavigate('billboard')}
            className="flex items-center gap-2.5 text-white group focus-visible:ring-2 focus-visible:ring-cinema-accent rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-cinema-accent flex items-center justify-center shadow-glow group-hover:scale-105 transition">
              <Film className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-red-400 bg-clip-text text-transparent">
                RIWI CINE
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                Multicine Premium
              </span>
            </div>
          </button>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
            <button
              type="button"
              onClick={() => onNavigate('billboard')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                currentPage === 'billboard'
                  ? 'bg-cinema-card text-white border border-cinema-border shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Cartelera
            </button>
            {user && (
              <button
                type="button"
                onClick={() => onNavigate('my-reservations')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  currentPage === 'my-reservations'
                    ? 'bg-cinema-card text-white border border-cinema-border shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Ticket className="w-4 h-4 text-cinema-accent" aria-hidden="true" />
                Mis Reservas
              </button>
            )}
          </nav>
        </div>

        {/* City Filter & Auth (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* City selector */}
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" aria-hidden="true" />
            <select
              id="city-select"
              aria-label="Seleccionar ciudad"
              value={selectedCityId || ''}
              onChange={(e) => onSelectCity(e.target.value ? Number(e.target.value) : null)}
              className="pl-9 pr-8 py-2 bg-cinema-card border border-cinema-border rounded-xl text-xs font-semibold text-slate-200 hover:border-slate-600 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent cursor-pointer transition appearance-none"
            >
              <option value="">Todas las Ciudades</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-cinema-border">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">
                  {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : user.email}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Cerrar Sesión"
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 transition focus-visible:ring-2 focus-visible:ring-cinema-accent"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="py-2 px-4 rounded-xl bg-cinema-accent hover:bg-red-700 text-white text-xs font-bold tracking-wide uppercase shadow-glow transition flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Ingresar
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-cinema-card border border-cinema-border text-slate-300 hover:text-white"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cinema-border bg-cinema-dark p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="relative">
            <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            <select
              aria-label="Seleccionar ciudad móvil"
              value={selectedCityId || ''}
              onChange={(e) => {
                onSelectCity(e.target.value ? Number(e.target.value) : null);
                setMobileMenuOpen(false);
              }}
              className="w-full pl-9 pr-3 py-2 bg-cinema-card border border-cinema-border rounded-xl text-xs font-semibold text-slate-200"
            >
              <option value="">Todas las Ciudades</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              onNavigate('billboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-white hover:bg-slate-800"
          >
            Cartelera
          </button>

          {user && (
            <button
              type="button"
              onClick={() => {
                onNavigate('my-reservations');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-white hover:bg-slate-800 flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-cinema-accent" />
              Mis Reservas
            </button>
          )}

          <div className="pt-2 border-t border-cinema-border">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">
                  {user.profile?.firstName || user.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400 font-bold hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-cinema-accent text-white font-bold text-xs uppercase rounded-xl tracking-wider shadow-glow"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
