// src/App.tsx

import React, { useEffect, useState } from 'react';
import { City } from './types/index.ts';
import { api } from './services/api.ts';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { BillboardPage } from './pages/BillboardPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { MyReservationsPage } from './pages/MyReservationsPage.tsx';

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('billboard');
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Load cities list
  useEffect(() => {
    api
      .getCities()
      .then((data) => setCities(data))
      .catch((err) => console.warn('No se pudieron cargar las ciudades:', err));
  }, []);

  // Handle URL hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('booking/')) {
        const id = parseInt(hash.replace('booking/', ''), 10);
        if (!isNaN(id)) {
          setSelectedShowtimeId(id);
          setCurrentPage('booking');
          return;
        }
      } else if (hash === 'my-reservations') {
        setCurrentPage('my-reservations');
        return;
      }
      setCurrentPage('billboard');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: string) => {
    if (page === 'billboard') {
      window.location.hash = '';
      setCurrentPage('billboard');
      setSelectedShowtimeId(null);
    } else if (page === 'my-reservations') {
      window.location.hash = 'my-reservations';
      setCurrentPage('my-reservations');
    }
  };

  const handleSelectShowtime = (showtimeId: number) => {
    setSelectedShowtimeId(showtimeId);
    window.location.hash = `booking/${showtimeId}`;
    setCurrentPage('booking');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cinema-dark text-slate-100">
      <Navbar
        cities={cities}
        selectedCityId={selectedCityId}
        onSelectCity={setSelectedCityId}
        currentPage={currentPage}
        onNavigate={navigateTo}
      />

      <main className="flex-1">
        {currentPage === 'billboard' && (
          <BillboardPage
            selectedCityId={selectedCityId}
            onSelectShowtime={handleSelectShowtime}
          />
        )}

        {currentPage === 'booking' && selectedShowtimeId && (
          <BookingPage
            showtimeId={selectedShowtimeId}
            onBack={() => navigateTo('billboard')}
            onViewMyReservations={() => navigateTo('my-reservations')}
          />
        )}

        {currentPage === 'my-reservations' && (
          <MyReservationsPage onGoToBillboard={() => navigateTo('billboard')} />
        )}
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
};
