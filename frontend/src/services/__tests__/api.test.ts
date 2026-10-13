// src/services/__tests__/api.test.ts

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiClientError } from '../api.ts';

describe('ApiClient - Verificación de Reglas de Oro', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Regla 1 y 2: Incluye credentials y sincroniza el header x-csrf-token en operaciones mutantes', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/csrf')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ csrfToken: 'riwi-csrf-secret-999' }),
        });
      }

      if (url.includes('/reservations')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 88, status: 'ACTIVE' }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });
    });

    globalThis.fetch = fetchMock;

    const res = await api.createReservation({ functionId: 2, seatIds: [1, 2] });
    expect(res.id).toBe(88);

    // Verificar llamada a /auth/csrf
    const csrfCall = fetchMock.mock.calls.find((call) =>
      call[0].includes('/auth/csrf'),
    );
    expect(csrfCall).toBeDefined();
    expect(csrfCall![1].credentials).toBe('include');

    // Verificar llamada mutante a /reservations
    const reservationCall = fetchMock.mock.calls.find((call) =>
      call[0].includes('/reservations'),
    );
    expect(reservationCall).toBeDefined();
    expect(reservationCall![1].credentials).toBe('include');
    expect(reservationCall![1].headers['x-csrf-token']).toBe('riwi-csrf-secret-999');
  });

  it('Regla 3: Refleja con precisión los IDs y coordenadas entregados por /cinemas/rooms/:roomId/seats', async () => {
    const mockRoomSeats = [
      {
        id: 101,
        roomId: 5,
        seatTypeId: 1,
        row: 'A',
        number: 1,
        seatNumber: 'A1',
        isAvailable: true,
        isActive: true,
        seatType: { id: 1, name: 'General', priceFactor: 1.0, priceModifier: 1.0 },
      },
      {
        id: 102,
        roomId: 5,
        seatTypeId: 2,
        row: 'A',
        number: 2,
        seatNumber: 'A2',
        isAvailable: true,
        isActive: true,
        seatType: { id: 2, name: 'VIP', priceFactor: 1.5, priceModifier: 1.5 },
      },
    ];

    globalThis.fetch = vi.fn().mockImplementation((url: string, options: any) => {
      expect(url).toContain('/cinemas/rooms/5/seats');
      expect(options.credentials).toBe('include');
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockRoomSeats),
      });
    });

    const seats = await api.getRoomSeats(5);
    expect(seats).toHaveLength(2);
    expect(seats[0].id).toBe(101);
    expect(seats[0].row).toBe('A');
    expect(seats[0].number).toBe(1);
    expect(seats[0].seatNumber).toBe('A1');
    expect(seats[1].id).toBe(102);
    expect(seats[1].seatType?.name).toBe('VIP');
  });

  it('Regla 4: Mapea y captura errores en el formato estándar del backend { statusCode, code, message }', async () => {
    const backendError = {
      statusCode: 403,
      code: 'AUTH_CSRF_INVALID',
      message: 'Token CSRF inválido o ausente',
      timestamp: '2026-10-13T12:00:00.000Z',
      path: '/api/v1/reservations',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve(backendError),
    });

    try {
      await api.createReservation({ functionId: 1, seatIds: [1] });
      expect.fail('Debería haber lanzado ApiClientError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('AUTH_CSRF_INVALID');
      expect(err.message).toBe('Token CSRF inválido o ausente');
      expect(err.data.path).toBe('/api/v1/reservations');
    }
  });
});
