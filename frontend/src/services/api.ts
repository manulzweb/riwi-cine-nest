// src/services/api.ts

import {
  ApiErrorResponse,
  BillboardItem,
  City,
  Cinema,
  Movie,
  Reservation,
  Room,
  RoomSeatDto,
  ShowtimeItem,
  ShowtimeSeatMapResponse,
  User,
} from '../types/index.ts';

export class ApiClientError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, any>;
  data?: ApiErrorResponse;

  constructor(errorResponse: ApiErrorResponse) {
    const msg = Array.isArray(errorResponse.message)
      ? errorResponse.message.join(', ')
      : (errorResponse.message || 'Error en la petición');
    super(msg);
    this.name = 'ApiClientError';
    this.statusCode = errorResponse.statusCode || 500;
    this.code = errorResponse.code || 'ERROR';
    this.details = errorResponse.details;
    this.data = errorResponse;
  }
}

const getApiBase = () => {
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.origin &&
    window.location.origin !== 'null'
  ) {
    return `${window.location.origin}${import.meta.env.VITE_API_BASE_URL || '/api/v1'}`;
  }
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};

class ApiClient {
  private csrfToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<() => void> = [];

  constructor() {
    // Only prefetch in browser environments when not running unit tests
    if (
      typeof window !== 'undefined' &&
      window.location?.hostname &&
      !process.env.VITEST
    ) {
      this.ensureCsrfToken().catch(() => {});
    }
  }

  // Regla de Oro 2: Sincronizar token CSRF obtenido de /api/v1/auth/csrf
  async ensureCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;

    try {
      const res = await fetch(`${getApiBase()}/auth/csrf`, {
        method: 'GET',
        credentials: 'include', // Regla de Oro 1
      });

      if (res.ok) {
        const data = await res.json();
        if (data.csrfToken) {
          this.csrfToken = data.csrfToken;
          return data.csrfToken;
        }
      }
    } catch (err) {
      console.warn('No se pudo precargar el token CSRF:', err);
    }
    return '';
  }

  private onRefreshed() {
    this.refreshSubscribers.forEach((callback) => callback());
    this.refreshSubscribers = [];
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${getApiBase()}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const isMutative = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Regla de Oro 2: Enviar x-csrf-token en todas las operaciones mutantes
    if (isMutative) {
      if (!this.csrfToken) {
        await this.ensureCsrfToken();
      }
      if (this.csrfToken) {
        headers['x-csrf-token'] = this.csrfToken;
      }
    }

    // Regla de Oro 1: Toda petición HTTP a la API debe incluir credenciales
    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Manejo de expiración de sesión (401) y rotación automática con Refresh Token
    if (
      response.status === 401 &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/refresh')
    ) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const refreshRes = await fetch(`${getApiBase()}/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Regla de Oro 1
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}),
            },
            body: JSON.stringify({}),
          });

          if (refreshRes.ok) {
            this.isRefreshing = false;
            this.onRefreshed();
            // Reintentar la solicitud original
            response = await fetch(url, {
              ...options,
              headers,
              credentials: 'include', // Regla de Oro 1
            });
          } else {
            this.isRefreshing = false;
          }
        } catch {
          this.isRefreshing = false;
        }
      } else {
        // En espera de que termine la rotación
        await new Promise<void>((resolve) => {
          this.refreshSubscribers.push(resolve);
        });
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include', // Regla de Oro 1
        });
      }
    }

    // Regla de Oro 4: Contemplar el formato estándar { statusCode, code, message } del backend
    if (!response.ok) {
      let errorData: ApiErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          statusCode: response.status,
          code: 'HTTP_ERROR',
          message: response.statusText,
        };
      }

      throw new ApiClientError(errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // --- Auth APIs ---
  async getCsrf() {
    return this.ensureCsrfToken();
  }

  async login(credentials: { email: string; password: string }): Promise<{ user: User }> {
    const result = await this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    await this.ensureCsrfToken();
    return result;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<{ user: User }> {
    const result = await this.request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await this.ensureCsrfToken();
    return result;
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/users/me');
  }

  // --- Locations & Cinemas ---
  async getCities(): Promise<City[]> {
    return this.request<City[]>('/locations/cities');
  }

  async getCinemas(cityId?: number): Promise<Cinema[]> {
    const query = cityId ? `?cityId=${cityId}` : '';
    return this.request<Cinema[]>(`/cinemas${query}`);
  }

  async getRooms(cinemaId: number): Promise<Room[]> {
    return this.request<Room[]>(`/cinemas/${cinemaId}/rooms`);
  }

  // Regla de Oro 3: Obtener IDs y coordenadas físicas de butacas entregadas por /cinemas/rooms/:roomId/seats
  async getRoomSeats(roomId: number): Promise<RoomSeatDto[]> {
    return this.request<RoomSeatDto[]>(`/cinemas/rooms/${roomId}/seats`);
  }

  // --- Movies & Showtimes ---
  async getBillboard(params?: {
    cityId?: number;
    cinemaId?: number;
    date?: string;
  }): Promise<BillboardItem[]> {
    const query = new URLSearchParams();
    if (params?.cityId) query.set('cityId', String(params.cityId));
    if (params?.cinemaId) query.set('cinemaId', String(params.cinemaId));
    if (params?.date) query.set('date', params.date);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<BillboardItem[]>(`/showtimes/billboard${queryString}`);
  }

  async getMovies(): Promise<Movie[]> {
    return this.request<Movie[]>('/movies');
  }

  async getPremieres(): Promise<Movie[]> {
    return this.request<Movie[]>('/movies/premieres');
  }

  async getMovie(id: number): Promise<Movie> {
    return this.request<Movie>(`/movies/${id}`);
  }

  async getShowtime(id: number): Promise<ShowtimeItem> {
    return this.request<ShowtimeItem>(`/showtimes/${id}`);
  }

  // --- Real-time Reservations & Seats ---
  async getFunctionSeats(functionId: number): Promise<ShowtimeSeatMapResponse> {
    return this.request<ShowtimeSeatMapResponse>(`/reservations/function/${functionId}/seats`);
  }

  async createReservation(data: {
    functionId: number;
    seatIds: number[];
  }): Promise<Reservation> {
    return this.request<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyReservations(): Promise<Reservation[]> {
    return this.request<Reservation[]>('/reservations/me');
  }

  async getReservation(id: number): Promise<Reservation> {
    return this.request<Reservation>(`/reservations/${id}`);
  }

  async confirmReservation(id: number): Promise<Reservation> {
    return this.request<Reservation>(`/reservations/${id}/confirm`, {
      method: 'POST',
    });
  }

  async cancelReservation(id: number): Promise<{ message: string; id: number }> {
    return this.request<{ message: string; id: number }>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
