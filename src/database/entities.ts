// src/database/entities.ts

import { EmailVerificationToken } from '../auth/entities/email-verification-token.entity';
import { LoginAudit } from '../auth/entities/login-audit.entity';
import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { CartTicket } from '../cart/entities/cart-ticket.entity';
import { Cinema } from '../cinemas/entities/cinema.entity';
import { Room } from '../cinemas/entities/room.entity';
import { Seat } from '../cinemas/entities/seat.entity';
import { SeatType } from '../cinemas/entities/seat-type.entity';
import { City } from '../locations/entities/city.entity';
import { Country } from '../locations/entities/country.entity';
import { Department } from '../locations/entities/department.entity';
import { BonusWallet } from '../loyalty/entities/bonus-wallet.entity';
import { Membership } from '../loyalty/entities/membership.entity';
import { MembershipLevel } from '../loyalty/entities/membership-level.entity';
import { MembershipStatus } from '../loyalty/entities/membership-status.entity';
import { Movie } from '../movies/entities/movie.entity';
import { NotificationPreference } from '../notifications/entities/notification-preference.entity';
import { UpcomingMovieNotification } from '../notifications/entities/upcoming-movie-notification.entity';
import { PurchaseHistory } from '../orders/entities/purchase-history.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReservationSeat } from '../reservations/entities/reservation-seat.entity';
import { CinemaFunction } from '../showtimes/entities/cinema-function.entity';
import { Promotion } from '../snacks/entities/promotion.entity';
import { Snack } from '../snacks/entities/snack.entity';
import { Profile } from '../users/entities/profile.entity';
import { Role } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';

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
