// src/components/__tests__/ReservationTimer.test.tsx

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReservationTimer } from '../ReservationTimer.tsx';

describe('ReservationTimer Component', () => {
  it('muestra el tiempo restante y tiene rol accesible status', () => {
    // 5 minutos en el futuro
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const onExpire = vi.fn();

    render(<ReservationTimer expiresAt={expiresAt} onExpire={onExpire} />);

    expect(screen.getByText('Tus butacas están reservadas')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('cambia a role alert cuando quedan menos de 2 minutos', () => {
    // 1 minuto en el futuro
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    const onExpire = vi.fn();

    render(<ReservationTimer expiresAt={expiresAt} onExpire={onExpire} />);

    expect(screen.getByText('¡Tiempo a punto de expirar!')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
