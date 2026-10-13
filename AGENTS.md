# Riwi Cine Backend - AI Agent Knowledge Base & System Memory
> **Documento de Memoria Persistente para Agentes de IA y Auditoría End-to-End (E2E)**  
> **Fecha de Última Auditoría:** 2026-10-13  
> **Auditor:** Experto E2E / Antigravity AI

---

## 1. Visión General del Proyecto y Arquitectura

- **Nombre:** Riwi Cine Backend (NestJS Migration)
- **Tipo de Aplicación:** API RESTful Multicine (Cartelera, Funciones, Salas, Butacas, Reservas Concurrentes, Carrito y Órdenes).
- **Stack Tecnológico:**
  - **Framework:** NestJS 11 + Express (TypeScript ESM).
  - **ORM:** TypeORM 0.3.x (`@nestjs/typeorm`) sobre PostgreSQL 16.
  - **Validación:** `class-validator` + `class-transformer` con ValidationPipe global (`whitelist: true, forbidNonWhitelisted: true, transform: true`).
  - **Testing:** Vitest 5.x + `@vitest/coverage-v8` + Supertest.
  - **Seguridad:** Cookies HttpOnly (`riwi_access_token`, `riwi_refresh_token`), CSRF (`csurf` con cookie `riwi_csrf_token` y header `x-csrf-token`), bcrypt para contraseñas.
  - **Documentación API:** Swagger en `/api/docs`.
  - **Prefijo Global:** `/api/v1` (excepto `/health` y `/health/*`).

---

## 2. Patrones de Diseño y Convenciones del Backend

1. **Estructura por Módulo:**
   - `entities/`: Entidades de TypeORM reflejando la BD relacional (nombres en snake_case en BD, camelCase en TypeScript).
   - `dao/`: Capa de Data Access Object extendiendo de `BaseDao<T>` (`src/common/dao/base.dao.ts`) para encapsular consultas a la BD.
   - `dto/`: Data Transfer Objects con decoradores Swagger (`@ApiProperty`) y `class-validator`.
   - `mappers/`: Transformación entre Entities y DTOs implementando `BaseMapper<E, D>`.
   - `*.service.ts`: Lógica de negocio y orquestación.
   - `*.controller.ts`: Endpoints HTTP con decoradores `@Public()` o `@Roles('admin', ...)`.
2. **Seguridad y Guards Globales:**
   - Registrados en `AppModule` con `APP_GUARD`:
     - `AuthGuard`: Requiere autenticación JWT por defecto a menos que se use `@Public()`. Lee cookie `riwi_access_token` o header `Bearer`.
     - `RolesGuard`: Valida roles contra `@Roles('...')`. Exige que el JWT tenga el rol adecuado (`user`, `admin`, etc.).
   - `HttpExceptionFilter`: Captura y estandariza todas las respuestas de error en formato uniforme: `{ statusCode, error, message, timestamp, path, code }`.

---

## 3. Catálogo de Schemas y Entidades (PostgreSQL)

| Dominio | Entidad TypeORM | Tabla en BD | Relaciones Principales |
|---|---|---|---|
| **Auth** | `RefreshToken` | `refresh_tokens` | `user_id` -> users |
| | `LoginAudit` | `login_audits` | `user_id` -> users |
| | `EmailVerificationToken` | `email_verification_tokens` | `user_id` -> users |
| | `PasswordResetToken` | `password_reset_tokens` | `user_id` -> users |
| **Users** | `User` | `users` | `role_id` -> roles, 1:1 con `Profile` |
| | `Profile` | `profiles` | `user_id` -> users |
| | `Role` | `roles` | 1:N con users |
| **Locations** | `Country` | `countries` | 1:N con departments |
| | `Department` | `departments` | `country_id` -> countries, 1:N con cities |
| | `City` | `cities` | `department_id` -> departments, 1:N con cinemas |
| **Cinemas** | `Cinema` | `cinemas` | `city_id` -> cities, 1:N con rooms |
| | `Room` | `rooms` | `cinema_id` -> cinemas, 1:N con seats |
| | `SeatType` | `seat_types` | 1:N con seats (General, Preferencial, VIP, etc.) |
| | `Seat` | `seats` | `room_id` -> rooms, `seat_type_id` -> seat_types |
| **Movies** | `Movie` | `movies` | 1:N con cinema_functions |
| **Showtimes** | `CinemaFunction` | `cinema_functions`| `movie_id` -> movies, `room_id` -> rooms |
| **Reservations** | `Reservation` | `reservations` | `user_id` -> users, `function_id` -> cinema_functions |
| | `ReservationSeat` | `reservation_seats` | `reservation_id`, `seat_id` |
| **Snacks** | `Snack` | `snacks` | Catálogo de confitería |
| | `Promotion` | `promotions` | Descuentos y combos |
| **Cart** | `Cart` | `carts` | `user_id` -> users |
| | `CartItem` | `cart_items` | Items de confitería en carrito |
| | `CartTicket` | `cart_tickets` | Asientos reservados en carrito |
| **Orders** | `PurchaseHistory` | `purchase_history` | Historial de transacciones completadas |
| **Loyalty** | `Membership` | `memberships` | Nivel y puntos del usuario |
| | `MembershipLevel` | `membership_levels`| Bronce, Plata, Oro |
| | `MembershipStatus` | `membership_statuses`| Activo, Inactivo |
| | `BonusWallet` | `bonus_wallets` | Saldo y monedero de bonos |
| **Notifications**| `NotificationPreference` | `notification_preferences` | Preferencias de usuario |
| | `UpcomingMovieNotification`| `upcoming_movie_notifications`| Alertas de estrenos |

---

## 4. Mapa Completo de Endpoints y Matriz de Control de Acceso

### 4.1 Auth (`/api/v1/auth`)
- `GET /csrf` (`@Public`): Genera y retorna token CSRF en cookie y payload JSON.
- `POST /register` (`@Public`, Exento CSRF en bootstrap): Crea cuenta, perfil y setea cookies de sesión.
- `POST /login` (`@Public`): Valida credenciales, registra auditoría en `login_audits`, emite tokens.
- `POST /refresh` (`@Public`): Rota token de refresco, detecta reuso fraudulento e invalida sesiones.
- `POST /logout` (`@Public` / Auth): Invalida refresh token y limpia cookies en el cliente.
- `POST /verify-email` (`@Public`): Valida token de confirmación de correo.
- `POST /forgot-password` (`@Public`): Envía token/enlace de recuperación.
- `POST /reset-password` (`@Public`): Restablece contraseña con token válido.

### 4.2 Users (`/api/v1/users`)
- `GET /me` (Autenticado): Retorna el perfil y datos del usuario actual (`@CurrentUser`).
- `PUT /me/profile` (Autenticado): Actualiza datos de perfil (nombre, teléfono, consentimientos).
- `GET /` (`@Roles('admin', 'super_admin')`): Lista usuarios con paginación/filtros.
- `GET /:id` (`@Roles('admin', 'super_admin')`): Obtiene detalle de un usuario.
- `PATCH /:id/status` (`@Roles('admin', 'super_admin')`): Activa o desactiva usuario.

### 4.3 Locations (`/api/v1/locations`)
- `GET /countries` (`@Public`): Lista países activos.
- `GET /departments` (`@Public`): Lista departamentos por país.
- `GET /cities` (`@Public`): Lista ciudades activas.
- `GET /cities/:id` (`@Public`): Detalle de ciudad.
- `POST /countries` (`@Roles('admin', 'super_admin')`): Crea país.
- `POST /departments` (`@Roles('admin', 'super_admin')`): Crea departamento.
- `POST /cities` (`@Roles('admin', 'super_admin')`): Crea ciudad.
- `PATCH /cities/:id/status` (`@Roles('admin', 'super_admin')`): Cambia estado de ciudad.

### 4.4 Cinemas & Rooms (`/api/v1/cinemas`)
- `GET /` (`@Public`): Lista multicines activos con filtros (ciudad, nombre).
- `GET /:id` (`@Public`): Detalle de un multicine.
- `GET /:id/rooms` (`@Public`): Salas de un multicine.
- `GET /seat-types` (`@Public`): Tipos de asientos disponibles.
- `GET /rooms/:roomId/seats` (`@Public`): Mapa de butacas de una sala.
- `GET /:cinemaId/rooms/:roomId/seats` (`@Public`): Alias para mapa de butacas.
- `POST /` (`@Roles('admin', 'super_admin')`): Registra cine.
- `PUT /:id` (`@Roles('admin', 'super_admin')`): Actualiza cine.
- `PATCH /:id/status` (`@Roles('admin', 'super_admin')`): Estado de cine.
- `POST /:cinemaId/rooms` (`@Roles('admin', 'super_admin')`): Crea sala para un cine.
- `POST /:cinemaId/rooms/:roomId/seats/generate` (`@Roles('admin', 'super_admin')`): Genera matriz de asientos en lote.
- `POST /rooms/:roomId/seats/generate` (`@Roles('admin', 'super_admin')`): Genera asientos.
- `POST /seat-types` (`@Roles('admin', 'super_admin')`): Crea tipo de asiento.

### 4.5 Movies (`/api/v1/movies`)
- `GET /premieres` (`@Public`): Lista películas en estado de estreno.
- `GET /` (`@Public`): Catálogo de películas con filtros (título, clasificación, género).
- `GET /:id` (`@Public`): Detalle de película.
- `POST /` (`@Roles('admin', 'super_admin')`): Crea película.
- `PUT /:id` (`@Roles('admin', 'super_admin')`): Edición completa.
- `PATCH /:id/status` (`@Roles('admin', 'super_admin')`): Activa/Inactiva película.
- `DELETE /:id` (`@Roles('admin', 'super_admin')`): Eliminación lógica/física.

### 4.6 Showtimes / Cartelera (`/api/v1/showtimes`)
- `GET /billboard` (`@Public`): Cartelera agregada por ciudad, cine y fecha.
- `GET /` (`@Public`): Lista funciones según filtros.
- `GET /:id` (`@Public`): Detalle de función y disponibilidad.
- `POST /` (`@Roles('admin', 'super_admin')`): Programa nueva función (valida solapamiento).
- `PUT /:id` (`@Roles('admin', 'super_admin')`): Actualiza horario/sala.
- `PATCH /:id/status` (`@Roles('admin', 'super_admin')`): Estado de función.
- `DELETE /:id` (`@Roles('admin', 'super_admin')`): Cancela función.

### 4.7 Health (`/health`)
- `GET /live` (`@Public`): Liveness probe para balanceador/Kubernetes.
- `GET /ready` (`@Public`): Readiness probe (comprueba ping a PostgreSQL).
- `GET /` (`@Public`): Resumen de salud.

### 4.8 Reservations (`/api/v1/reservations`)
- `POST /` (Autenticado): Crea reserva y bloquea butacas en tiempo real (TTL 10m).
- `GET /function/:functionId/seats` (`@Public`): Mapa de disponibilidad de butacas en tiempo real (AVAILABLE, LOCKED, SOLD) con detección de butacas del usuario actual.
- `GET /me` (Autenticado): Historial de reservas del usuario activo con actualización de expiraciones.
- `GET /:id` (Autenticado): Detalle de una reserva con validación de propiedad o rol admin.
- `POST /:id/confirm` (Autenticado): Confirma definitivamente la reserva y transiciona butacas a SOLD.
- `DELETE /:id` (Autenticado): Cancela la reserva activa y libera las butacas.

---

## 5. Módulos en Fase de Persistencia / Transición (Próximos Endpoints)

Estos módulos cuentan con sus **Entities, DAOs y Mappers** construidos y exportados, pendientes de exposición de Controllers y Services finales según el Plan de Migración:
1. **`cart`**:
   - `Cart`, `CartItem`, `CartTicket`.
   - Almacenamiento temporal de entradas y dulcería antes del checkout con TTL de reserva.
2. **`orders`**:
   - `PurchaseHistory`.
   - Registro final y generación de comprobante de compra.
3. **`snacks`**:
   - `Snack`, `Promotion`.
   - Catálogo de combos y productos de confitería.
4. **`loyalty`**:
   - `Membership`, `MembershipLevel`, `MembershipStatus`, `BonusWallet`.
   - Sistema de fidelización, acumulación y redención de puntos.
5. **`notifications`**:
   - `NotificationPreference`, `UpcomingMovieNotification`.


---

## 6. Reglas de Validación E2E y Pruebas

- **Ejecución de Pruebas Unitarias:** `npm test` (vitest en `app/`). Total actual: 64 pruebas pasando (100% éxito).
- **Ejecución E2E:** `npm run test:e2e` (usa `vitest.config.e2e.ts` y PostgreSQL activo).
- **Cobertura Mínima Exigida:**
  - 40% global.
  - 70% en módulos críticos (`auth`, `reservations`, `orders`).
- **Validaciones de Seguridad E2E Obligatorias:**
  1. Solicitud a endpoint protegido sin cookie/token -> `401 Unauthorized (AUTH_INVALID_CREDENTIALS)`.
  2. Solicitud con rol insuficiente (ej. usuario regular a `POST /movies`) -> `403 Forbidden (FORBIDDEN_ROLE)`.
  3. Petición mutante (POST/PUT/DELETE) sin token CSRF -> `403 Forbidden (EBADCSRFTOKEN)`.
  4. Intentos de rotación de Refresh Token ya consumido -> revocación de todos los tokens del usuario (detección de reuso fraudulento).

---

## 7. Instrucciones Mandatorias para Agentes Autónomos (Strict Policy)

Todo agente de IA (Antigravity u otros) que opere en este repositorio **DEBE CUMPLIR OBLIGATORIAMENTE** con las siguientes directrices:

1. **Consulta Previa Obligatoria (`AGENTS.md` y `MEMORY.md`):**  
   Antes de generar o modificar código, revisa siempre `AGENTS.md` para verificar esquemas, convenciones y endpoints, y `MEMORY.md` para conocer el estado actual y evitar retrabajo.
2. **Consistencia Arquitectónica Estricta:**  
   Al implementar cualquier módulo nuevo o faltante (`reservations`, `cart`, `orders`, `snacks`, etc.), sigue estrictamente el flujo unidireccional:  
   `Entity` -> `Dao (BaseDao)` -> `Mapper (BaseMapper)` -> `DTOs` -> `Service` -> `Controller`.
3. **Seguridad y Control de Acceso por Defecto:**  
   Todo endpoint nuevo debe explicitar su seguridad: usar `@Public()` si es abierto, o `@Roles('admin', 'super_admin')` si es restringido. Nunca dejes rutas desprotegidas por omisión.
4. **OBLIGACIÓN ABSOLUTA DE ACTUALIZAR `MEMORY.md`:**  
   - **En CADA tarea o iteración** donde se creen archivos, se modifique lógica de negocio, se agreguen endpoints, se corran pruebas o se tome una decisión de arquitectura, el agente **TIENE LA OBLIGACIÓN ESTRICTA** de actualizar `MEMORY.md`.
   - Debes actualizar:
     - La **Matriz de Progreso** (marcando componentes con ✅ o ⏳).
     - La **Bitácora de Cambios (Changelog de Aprendizaje)** con la fecha, cambios realizados y decisiones tomadas.
     - Los **Próximos Pasos Prioritarios**.
   - No des por terminada una tarea sin haber persistido el estado en `MEMORY.md`.
5. **Mantenimiento de `AGENTS.md`:**  
   Si introduces nuevas entidades, tablas en la BD o nuevos endpoints en los controladores, debes actualizar las secciones 3 y 4 de este `AGENTS.md` para preservar la memoria del sistema a largo plazo.

