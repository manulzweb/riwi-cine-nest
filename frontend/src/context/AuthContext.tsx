// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useNotification } from './NotificationContext.tsx';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { notify } = useNotification();

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setAuthModalOpen(false);
      notify(`¡Bienvenido de vuelta, ${res.user.profile?.firstName || res.user.email}!`, 'success');
    } catch (err: any) {
      notify(err.message || 'Error al iniciar sesión', 'error');
      throw err;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      const res = await api.register(data);
      setUser(res.user);
      setAuthModalOpen(false);
      notify('¡Cuenta creada y sesión iniciada con éxito!', 'success');
    } catch (err: any) {
      notify(err.message || 'Error al registrarse', 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      notify('Has cerrado sesión correctamente', 'info');
    } catch (err: any) {
      setUser(null);
      notify(err.message || 'Sesión finalizada', 'info');
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authModalOpen,
        authModalMode,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
