// src/components/AuthModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Film, Lock, Mail, Phone, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authModalOpen) {
      setTimeout(() => emailInputRef.current?.focus(), 50);
    }
  }, [authModalOpen, authModalMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ email, password, firstName, lastName, phone });
      }
    } catch {
      // Notification handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-cinema-card border border-cinema-border rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cinema-accent/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-cinema-accent" aria-hidden="true" />
            <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight text-white">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-cinema-accent"
            aria-label="Cerrar modal de autenticación"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-cinema-border mb-6">
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2 ${
              isLogin
                ? 'border-cinema-accent text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => openAuthModal('login')}
          >
            Ingresar
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-semibold transition border-b-2 ${
              !isLogin
                ? 'border-cinema-accent text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => openAuthModal('register')}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-first-name" className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Carlos"
                    className="w-full pl-9 pr-3 py-2 bg-cinema-dark border border-cinema-border rounded-xl text-sm text-white placeholder-slate-500 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-last-name" className="block text-xs font-medium text-slate-300 mb-1">
                  Apellido
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Gómez"
                    className="w-full pl-9 pr-3 py-2 bg-cinema-dark border border-cinema-border rounded-xl text-sm text-white placeholder-slate-500 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
              <input
                ref={emailInputRef}
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@riwi.io"
                className="w-full pl-9 pr-3 py-2 bg-cinema-dark border border-cinema-border rounded-xl text-sm text-white placeholder-slate-500 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
              <input
                id="auth-password"
                type="password"
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-cinema-dark border border-cinema-border rounded-xl text-sm text-white placeholder-slate-500 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="reg-phone" className="block text-xs font-medium text-slate-300 mb-1">
                Teléfono (Opcional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full pl-9 pr-3 py-2 bg-cinema-dark border border-cinema-border rounded-xl text-sm text-white placeholder-slate-500 focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-2.5 px-4 bg-cinema-accent hover:bg-red-700 text-white font-semibold rounded-xl transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              'Entrar'
            ) : (
              'Completar Registro'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
