// src/components/__tests__/SeatMap.test.tsx

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeatMap } from '../SeatMap.tsx';
import { SeatItem } from '../../types/index.ts';

const mockSeats: SeatItem[] = [
  {
    id: 1,
    row: 'A',
    number: 1,
    seatNumber: 'A1',
    seatType: 'General',
    priceFactor: 1.0,
    price: 15000,
    status: 'AVAILABLE',
    isMine: false,
  },
  {
    id: 2,
    row: 'A',
    number: 2,
    seatNumber: 'A2',
    seatType: 'VIP',
    priceFactor: 1.5,
    price: 22500,
    status: 'LOCKED',
    isMine: false,
  },
  {
    id: 3,
    row: 'A',
    number: 3,
    seatNumber: 'A3',
    seatType: 'General',
    priceFactor: 1.0,
    price: 15000,
    status: 'SOLD',
    isMine: false,
  },
];

describe('SeatMap Component', () => {
  it('renderiza la pantalla de cine y las butacas con sus etiquetas de accesibilidad', () => {
    render(
      <SeatMap
        seats={mockSeats}
        selectedSeatIds={[]}
        onToggleSeat={vi.fn()}
      />,
    );

    expect(screen.getByText('PANTALLA')).toBeInTheDocument();

    const seatA1 = screen.getByLabelText(/Butaca A1/i);
    expect(seatA1).toBeInTheDocument();
    expect(seatA1).not.toBeDisabled();

    const seatA2 = screen.getByLabelText(/Butaca A2/i);
    expect(seatA2).toBeDisabled(); // Locked by other

    const seatA3 = screen.getByLabelText(/Butaca A3/i);
    expect(seatA3).toBeDisabled(); // Sold
  });

  it('llama a onToggleSeat al hacer clic en una butaca disponible', () => {
    const onToggle = vi.fn();
    render(
      <SeatMap
        seats={mockSeats}
        selectedSeatIds={[]}
        onToggleSeat={onToggle}
      />,
    );

    const seatA1 = screen.getByLabelText(/Butaca A1/i);
    fireEvent.click(seatA1);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(mockSeats[0]);
  });

  it('soporta navegación y selección por teclado (Enter y Espacio)', () => {
    const onToggle = vi.fn();
    render(
      <SeatMap
        seats={mockSeats}
        selectedSeatIds={[]}
        onToggleSeat={onToggle}
      />,
    );

    const seatA1 = screen.getByLabelText(/Butaca A1/i);
    fireEvent.keyDown(seatA1, { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(seatA1, { key: ' ' });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('indica visual y semánticamente el estado aria-pressed cuando una butaca está seleccionada', () => {
    render(
      <SeatMap
        seats={mockSeats}
        selectedSeatIds={[1]}
        onToggleSeat={vi.fn()}
      />,
    );

    const seatA1 = screen.getByLabelText(/Butaca A1/i);
    expect(seatA1).toHaveAttribute('aria-pressed', 'true');
  });
});
