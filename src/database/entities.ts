// src/database/entities.ts

import { EmailVerificationToken } from '../modules/auth/entities/email-verification-token.entity';
import { LoginAudit } from '../modules/auth/entities/login-audit.entity';
import { PasswordResetToken } from '../modules/auth/entities/password-reset-token.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { Cart } from '../modules/cart/entities/cart.entity';
import { CartItem } from '../modules/cart/entities/cart-item.entity';
import { CartTicket } from '../modules/cart/entities/cart-ticket.entity';
import { Cinema } from '../modules/cinemas/entities/cinema.entity';
import { Room } from '../modules/cinemas/entities/room.entity';
import { Seat } from '../modules/cinemas/entities/seat.entity';
import { SeatType } from '../modules/cinemas/entities/seat-type.entity';
import { City } from '../modules/locations/entities/city.entity';
import { Country } from '../modules/locations/entities/country.entity';
import { Department } from '../modules/locations/entities/department.entity';
import { BonusWallet } from '../modules/loyalty/entities/bonus-wallet.entity';
import { Membership } from '../modules/loyalty/entities/membership.entity';
import { MembershipLevel } from '../modules/loyalty/entities/membership-level.entity';
import { MembershipStatus } from '../modules/loyalty/entities/membership-status.entity';
import { Movie } from '../modules/movies/entities/movie.entity';
import { NotificationPreference } from '../modules/notifications/entities/notification-preference.entity';
import { UpcomingMovieNotification } from '../modules/notifications/entities/upcoming-movie-notification.entity';
import { PurchaseHistory } from '../modules/orders/entities/purchase-history.entity';
import { Reservation } from '../modules/reservations/entities/reservation.entity';
import { ReservationSeat } from '../modules/reservations/entities/reservation-seat.entity';
import { CinemaFunction } from '../modules/showtimes/entities/cinema-function.entity';
import { Promotion } from '../modules/snacks/entities/promotion.entity';
import { Snack } from '../modules/snacks/entities/snack.entity';
import { Profile } from '../modules/users/entities/profile.entity';
import { Role } from '../modules/users/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';

export const ALL_ENTITIES = [
  // Auth
  RefreshToken,
  LoginAudit,
  EmailVerificationToken,
  PasswordResetToken,
  // Users
  Role,
  User,
  Profile,
  // Locations
  Country,
  Department,
  City,
  // Cinemas
  Cinema,
  Room,
  SeatType,
  Seat,
  // Movies & Showtimes
  Movie,
  CinemaFunction,
  // Loyalty
  MembershipLevel,
  MembershipStatus,
  Membership,
  BonusWallet,
  // Notifications
  NotificationPreference,
  UpcomingMovieNotification,
  // Reservations
  Reservation,
  ReservationSeat,
  // Snacks
  Snack,
  Promotion,
  // Cart
  Cart,
  CartItem,
  CartTicket,
  // Orders
  PurchaseHistory,
];
