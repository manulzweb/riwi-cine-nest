<USER_REQUEST>
# Plan de migración: Riwi Cine Backend a NestJS
https://github.com/manulzweb/riwi-cine-backend-1

**Archivo:** `PLAN_MIGRACION_RIWI_CINE_NESTJS.md`  
**Estado:** Aprobado para implementación condicionada a inventario del backend actual  
**Backend origen:** Express + Sequelize + PostgreSQL  
**Backend destino:** NestJS + TypeScript + TypeORM + PostgreSQL  
**Versión inicial de API:** `/api/v1`

## 1. Estado del documento

### 1.1 Propósito

Este documento define el plan técnico para reemplazar el backend actual de Riwi Cine, construido con Express, Sequelize y PostgreSQL, por un backend construido con NestJS, TypeScript y TypeORM.

El documento registra las decisiones de arquitectura, seguridad, persistencia, infraestructura, pruebas y orden de implementación. Las decisiones aquí descritas deberán utilizarse como referencia durante la creación del repositorio nuevo.

### 1.2 Regla de validación del sistema actual

La lista de features, entidades y relaciones incluida en este documento proviene de la descripción funcional disponible del proyecto actual. No se considera todavía una representación definitiva del código existente.

Antes de crear o ejecutar migraciones de entidades se debe contrastar cada elemento con:

```text
app/src/models
```

El inventario debe comprobar, como mínimo:

- Nombre real de la tabla.
- Nombre real de cada columna.
- Tipo de dato.
- Clave primaria.
- Claves foráneas.
- Índices.
- Restricciones `UNIQUE`.
- Valores por defecto.
- Relaciones Sequelize.
- Reglas de nulabilidad.
- Datos que deben conservarse.
- Transformaciones necesarias.
- Diferencias entre el modelo documentado y el modelo real.

Ninguna migración destructiva podrá aprobarse basándose solamente en la descripción funcional.

### 1.3 Decisiones ya aprobadas

| Tema | Decisión |
|---|---|
| Framework | NestJS con TypeScript |
| Migración | Reemplazo directo, con validación progresiva antes de habilitar escrituras |
| Backend Express | Congelado; solo se aceptan correcciones críticas |
| ORM | TypeORM mediante `@nestjs/typeorm` |
| Arquitectura | Modular por features, con capas simples |
| Controllers | Se permiten varios controllers dentro de un mismo módulo |
| Base de datos | PostgreSQL existente |
| Migraciones | TypeORM CLI; `synchronize` siempre desactivado |
| Seeders | Separados de las migraciones |
| API | REST idiomático de NestJS |
| Versionamiento | Versionamiento por URI: `/api/v1` |
| Entorno local | Docker Compose |
| Despliegue | VPS propio con Docker Compose |
| Balanceador | Nginx |
| Roles | Un rol por usuario mediante `users.role_id` |
| Autorización | `@Roles()` por nombre de rol |
| Permisos | Fuera del alcance inicial |
| Tokens | Access y refresh tokens en cookies |
| CSRF | Token CSRF más `SameSite=Lax` |
| Refresh tokens | Rotación y detección de reutilización |
| Expiración | Expiración perezosa mediante `expires_at` |
| Compras | Entidades nuevas `Order` y `OrderItem` |
| Pagos | Feature propio con interfaces y providers intercambiables |
| Instancias | API sin estado contra una base compartida |
| Logs | Pino |
| Health checks | Liveness y readiness |
| Cobertura | 40 % global; 70 % en `auth`, `reservations` y `orders` |
| Paginación | Definida por endpoint |

## 2. Objetivos y alcance

### 2.1 Objetivos

- Migrar el backend a NestJS y TypeScript.
- Mantener PostgreSQL como base de datos principal.
- Mejorar la organización por capacidades de negocio.
- Centralizar autenticación y autorización mediante guards globales.
- Formalizar migraciones y cambios de esquema con TypeORM.
- Preparar la API para varias instancias detrás de un balanceador.
- Mantener la consistencia de reservas de asientos bajo concurrencia.
- Separar órdenes, pagos y reservas.
- Incorporar pruebas unitarias, de integración, E2E y concurrencia.
- Documentar la API mediante Swagger/OpenAPI.
- Proporcionar una base operable en local, staging y producción.

### 2.2 No objetivos iniciales

Quedan fuera de la primera versión:

- Sistema configurable de permisos (`permissions` y `role_permissions`).
- Múltiples roles por usuario.
- Limpieza automática de filas vencidas mediante cron o worker.
- Elección definitiva del proveedor de pagos.
- Rediseño completo del frontend.
- Microservicios.
- Event bus externo.
- Cache distribuida.
- Sesiones almacenadas en memoria.
- Soft delete obligatorio para todas las tablas.
- Migración automática o destructiva del esquema existente.

## 3. Estrategia de migración

### 3.1 Estrategia seleccionada

Se realizará un reemplazo directo del backend Express por NestJS. Durante la preparación, Express permanecerá congelado y solo recibirá correcciones críticas que sean necesarias para mantener la operación.

NestJS se conectará inicialmente a la misma base de datos existente, pero comenzará en modo de lectura. Las escrituras se habilitarán después de completar la validación de entidades, pruebas de integración y pruebas E2E.

### 3.2 Etapas de compatibilidad

1. Inventariar `app/src/models`.
2. Crear una copia de la base de datos actual.
3. Crear entidades TypeORM compatibles con el esquema comprobado.
4. Ejecutar NestJS en modo de lectura.
5. Comparar consultas y resultados con el backend actual.
6. Ejecutar pruebas E2E.
7. Habilitar escrituras primero en `users` y `auth`.
8. Habilitar catálogo.
9. Habilitar reservas.
10. Habilitar pagos, carrito y órdenes.
11. Cambiar el tráfico principal al backend NestJS.
12. Mantener un procedimiento documentado de rollback.

### 3.3 Regla para el esquema

La primera migración no debe recrear automáticamente todo el esquema existente. Solo podrá:

- Crear tablas nuevas aprobadas.
- Agregar columnas aprobadas.
- Agregar índices aprobados.
- Agregar restricciones compatibles con los datos actuales.
- Transformar datos mediante una migración explícita y revisada.

No se permite usar `synchronize: true`, ni siquiera en desarrollo compartido o staging.

### 3.4 Criterios de salida de Express

Express podrá retirarse cuando:

- Todos los features críticos estén disponibles en NestJS.
- Se hayan completado las pruebas E2E.
- Se haya validado autenticación con cookies y CSRF.
- Se hayan probado reservas concurrentes con dos instancias.
- Se haya validado el checkout transaccional.
- Se haya ejecutado un ensayo de rollback.
- Se haya aprobado el cambio de tráfico.

## 4. Arquitectura de aplicación

### 4.1 Estilo

La aplicación utilizará una arquitectura modular basada en features. Cada feature representa una capacidad de negocio, posee sus entidades, DTOs, controllers y services, y es propietario de las tablas que escribe.

No se implementará Clean Architecture completa. Se utilizarán capas simples para reducir complejidad accidental:

```text
Controller -> Service -> Repository/Entity
```

Cuando una operación involucre varios features, el feature coordinador llamará a los services exportados por los demás módulos. No accederá directamente a repositories privados de otros módulos.

### 4.2 Criterio para delimitar un feature

Un feature debe cumplir estas condiciones:

- Se puede nombrar con un sustantivo.
- Representa una capacidad de negocio.
- Tiene una o más entidades propias.
- Escribe sus propias tablas.
- Tiene endpoints o reglas de negocio propias.
- Puede describirse en una frase sin usar “y”.
- No necesita importar el repository privado de otro feature.

Si dos features dependen circularmente entre sí, se debe fusionar uno de ellos o extraer la parte compartida a un tercer módulo.

### 4.3 Estructura global

```text
src/
├── main.ts
├── app.module.ts
├── config/
│   ├── configuration.ts
│   └── env.validation.ts
├── database/
│   ├── data-source.ts
│   ├── migrations/
│   └── seeders/
├── common/
│   ├── constants/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── pipes/
│   └── csrf/
├── health/
├── auth/
├── users/
├── loyalty/
├── notifications/
├── locations/
├── cinemas/
├── movies/
├── showtimes/
├── reservations/
├── snacks/
├── cart/
├── payments/
└── orders/
```

### 4.4 Estructura de un feature

```text
src/orders/
├── orders.module.ts
├── controllers/
│   ├── orders.controller.ts
│   └── purchase-history.controller.ts
├── services/
│   ├── orders.service.ts
│   └── purchase-history.service.ts
├── entities/
├── dto/
├── types/
└── tests/
```

Un service inyectará `Repository<Entidad>` directamente cuando las consultas sean triviales. Solo se creará una clase de repository propia cuando las consultas o reglas de persistencia dejen de ser triviales.

## 5. Features y dependencias

### 5.1 Matriz de features

| Feature | Entidades principales | Dependencias |
|---|---|---|
| `auth` | `RefreshToken`, `LoginAudit`, `EmailVerificationToken`, `PasswordResetToken` | `users` |
| `users` | `User`, `Role`, `Profile` | Ninguna de negocio |
| `loyalty` | `Membership`, `BonusWallet` | `users` |
| `notifications` | `NotificationPreference`, `UpcomingMovieNotification` | `users`, `movies` |
| `locations` | `Country`, `Department`, `City` | Ninguna |
| `cinemas` | `Cinema`, `Room`, `Seat`, `SeatType` | `locations` |
| `movies` | `Movie` | Ninguna |
| `showtimes` | `CinemaFunction` | `movies`, `cinemas` |
| `reservations` | `Reservation`, `ReservationSeat` | `showtimes`, `cinemas`, `users` |
| `snacks` | `Snack`, `Promotion` | Ninguna |
| `cart` | `Cart`, `CartItem`, `CartTicket` | `snacks`, `reservations`, `showtimes` |
| `payments` | Abstracciones y registros de pago por confirmar | `users`, posiblemente `orders` según el proveedor |
| `orders` | `Order`, `OrderItem` | `cart`, `reservations`, `loyalty`, `payments` |
| `health` | Sin entidades de negocio | Infraestructura |

### 5.2 Límites confirmados

- `Room`, `Seat` y `SeatType` viven en `cinemas` porque no existen sin un cine.
- La cartelera es una consulta de `showtimes`; no es un feature independiente.
- `OrderItem` vive en `orders`.
- `LoginAudit` vive en `auth`.
- `auth` no posee `User` ni `Role`.
- `payments` contiene contratos y adapters del proveedor, no reglas de reserva.
- `PurchaseHistory` será una consulta sobre `orders`, no una entidad de compra independiente.

## 6. Modelo de datos y migraciones

### 6.1 Reglas TypeORM

La configuración debe cumplir:

```ts
synchronize: false
```

Las migraciones se ejecutarán mediante comandos explícitos. La API no debe ejecutar migraciones durante su arranque.

Scripts esperados:

```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts src/database/migrations/Generated",
  "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts",
  "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts"
}
```

Los nombres exactos podrán adaptarse al compilador y al modo ESM/CommonJS seleccionado, pero deben mantenerse separados los comandos de generación, ejecución y reversión.

### 6.2 Data source

`src/database/data-source.ts` será utilizado por la CLI y no dependerá de la instancia HTTP de NestJS.

Debe obtener la configuración desde variables de entorno y definir explícitamente:

- Host o `DATABASE_URL`.
- Puerto.
- Usuario.
- Contraseña.
- Base de datos.
- SSL según entorno.
- Entidades.
- Directorio de migraciones.
- Logging de migraciones.

### 6.3 Seeders

Los seeders estarán separados de las migraciones. Deben ser idempotentes y seguros ante ejecuciones repetidas.

Los roles iniciales serán:

```text
cliente
admin
```

El rol por defecto se identifica mediante `is_default`, no mediante un nombre escrito dentro del código de registro.

El registro debe resolver el rol consultando la base de datos:

```text
SELECT id FROM roles WHERE is_default = true
```

La base de datos debe impedir más de un rol por defecto mediante un índice único parcial:

```sql
CREATE UNIQUE INDEX uq_roles_single_default
ON roles (is_default)
WHERE is_default = true;
```

### 6.4 Inventario obligatorio

Antes de crear entidades se debe completar una tabla como esta por cada modelo:

| Modelo Sequelize | Tabla | Entidad TypeORM | PK | FKs | Índices | Soft delete | Transformación |
|---|---|---|---|---|---|---|---|
| Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente |

El inventario debe ser revisado antes de ejecutar migraciones sobre datos reales.

### 6.5 Identificadores y fechas

Las nuevas entidades utilizarán identificadores enteros autoincrementales, salvo que el inventario del sistema actual obligue a conservar otro tipo.

Las fechas se almacenarán en UTC con `timestamp with time zone`. La API debe serializar fechas en ISO 8601.

### 6.6 Soft delete

El soft delete es selectivo. Cada feature debe documentar por entidad si utiliza `deleted_at`.

Se espera utilizar soft delete en entidades de catálogo o cuentas cuando la eliminación lógica preserve referencias históricas. No se utilizará automáticamente para tokens o entidades temporales cuya semántica sea expiración o revocación.

## 7. Autenticación y autorización

### 7.1 Guards globales

Se registrarán dos guards globales mediante `APP_GUARD`:

```ts
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
]
```

El `AuthGuard` debe ejecutarse primero para poblar `request.user`. Luego `RolesGuard` utilizará los datos autenticados y la metadata de roles.

### 7.2 Decorador `@Roles()`

```ts
// common/constants/roles-key.constant.ts
export const ROLES_KEY = 'roles';
```

```ts
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/roles-key.constant';

export const Roles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
```

Uso:

```ts
@Roles('admin')
@Roles('admin', 'cashier')
```

Los nombres se utilizan en la metadata porque los IDs pueden variar entre ambientes.

### 7.3 Decorador `@Public()`

```ts
// common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Las rutas públicas iniciales serán:

- Registro.
- Login.
- Refresh token.
- Verificación de email.
- Solicitud de recuperación de contraseña.
- Health checks.
- Documentación Swagger, según el entorno.

### 7.4 Decorador `@CurrentUser()`

Se utilizará un decorador de parámetro para evitar repetir el acceso directo a `request.user` en los controllers.

```ts
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 7.5 Responsabilidades de `AuthGuard`

El guard debe:

1. Revisar si la ruta tiene `@Public()`.
2. Obtener el access token desde la cookie `riwi_access_token`.
3. Validar firma y expiración.
4. Validar que el token sea de tipo access.
5. Extraer claims mínimos.
6. Asignar los claims a `request.user`.
7. Rechazar tokens ausentes, inválidos o expirados.

### 7.6 Responsabilidades de `RolesGuard`

El guard debe:

1. Obtener roles de handler y controller mediante `Reflector`.
2. Permitir la ruta si no existe metadata de roles.
3. Leer el usuario autenticado.
4. Comparar el rol permitido con el rol autenticado.
5. Responder `403 Forbidden` cuando el usuario no tenga autorización.

### 7.7 Cookies

Nombres aprobados:

```text
riwi_access_token
riwi_refresh_token
```

Propiedades esperadas:

```text
HttpOnly: true
Secure: true en producción
SameSite: Lax
```

El refresh token deberá utilizar un `Path` restringido al endpoint de refresh cuando la estructura definitiva de rutas esté confirmada.

### 7.8 CSRF

La autenticación por cookies exige protección contra CSRF para operaciones mutables.

La estrategia será:

- `SameSite=Lax`.
- Token CSRF generado y entregado al cliente.
- Header obligatorio, por ejemplo `X-CSRF-Token`.
- Validación en métodos `POST`, `PUT`, `PATCH` y `DELETE`.
- Exclusión documentada para rutas públicas que no cambien estado autenticado.
- Pruebas negativas sin token y con token inválido.

La configuración exacta se implementará mediante la capacidad CSRF de NestJS o un middleware compatible con el adaptador HTTP seleccionado.

### 7.9 Refresh tokens

El refresh token no se almacenará en texto plano. Se guardará un hash.

Campos mínimos recomendados:

```text
id
user_id
token_hash
token_family
expires_at
revoked_at
replaced_by_token_id
created_at
last_used_at
```

Flujo de rotación:

1. Leer el refresh token desde la cookie.
2. Calcular o comparar su hash.
3. Verificar expiración y revocación.
4. Detectar si ya fue utilizado.
5. Si fue reutilizado, revocar la familia completa.
6. Crear un nuevo access token.
7. Crear un nuevo refresh token.
8. Revocar el token anterior.
9. Escribir las nuevas cookies.

### 7.10 Claims

El access token utilizará claims mínimos, como mínimo:

```text
sub
role
tokenType
iat
exp
```

El refresh token utilizará un tipo distinto y no debe aceptarse en endpoints protegidos como access token.

El cambio de rol se reflejará al renovar el token. Un access token vigente puede conservar temporalmente el rol incluido en sus claims hasta que expire.

### 7.11 Seguridad adicional

Se conservarán o migrarán:

- Bloqueo temporal por intentos fallidos.
- `LoginAudit`.
- Verificación de email.
- Recuperación de contraseña.
- Captcha en registro y login.
- Hash de contraseñas con `bcrypt`.

## 8. Usuarios y roles

### 8.1 Entidades

`users` será responsable de:

- `User`.
- `Role`.
- `Profile`.

`Profile` será una tabla separada con relación uno a uno obligatoria con `User`.

### 8.2 Roles

La tabla `roles` tendrá como mínimo:

```text
id
name
description
is_default
created_at
updated_at
```

`name` será único. No existirán endpoints para editar roles en la primera versión.

Para agregar un nuevo rol, por ejemplo `cashier`, se creará un cambio controlado de datos y se utilizará en el código:

```ts
@Roles('cashier')
```

La base de datos define qué roles existen y qué rol tiene cada usuario. El código define qué nombres de rol acepta cada ruta.

## 9. Reservas y concurrencia

### 9.1 Estados

`Reservation` utilizará:

```text
PENDING
CONFIRMED
EXPIRED
CANCELLED
```

La confirmación de reserva debe estar asociada al resultado de la operación de compra y pago.

### 9.2 Expiración perezosa

Las reservas y carritos temporales utilizarán `expires_at`.

Una fila solo es válida cuando:

```sql
expires_at > now()
```

Una reserva confirmada debe tener `expires_at` nulo o equivalente a infinito para no ser considerada vencida.

No se ejecutará un job de limpieza en la primera versión. Las filas vencidas podrán acumularse sin afectar la corrección funcional, pero se documentará una estrategia futura de limpieza manual o independiente.

### 9.3 Asientos

`reservation_seats` incluirá:

```text
reservation_id
function_id
seat_id
expires_at
```

Se debe crear una restricción única sobre:

```text
(function_id, seat_id)
```

La reserva se realizará dentro de una transacción mediante una operación equivalente a:

```sql
INSERT INTO reservation_seats (
  reservation_id,
  function_id,
  seat_id,
  expires_at
)
VALUES ($1, $2, $3, $4)
ON CONFLICT (function_id, seat_id) DO UPDATE
  SET reservation_id = EXCLUDED.reservation_id,
      expires_at = EXCLUDED.expires_at
  WHERE reservation_seats.expires_at < now()
RETURNING seat_id;
```

Si el número de filas devueltas es menor que el número de asientos solicitados, la transacción se revierte y la API responde conflicto.

Esta operación debe validarse mediante una prueba real con dos instancias de API contra la misma base de datos.

### 9.4 Checkout

El checkout coordina:

1. Validación del carrito.
2. Validación de disponibilidad.
3. Creación de la orden pendiente.
4. Creación o confirmación del pago.
5. Confirmación del pago mediante proveedor.
6. Reserva o confirmación definitiva de asientos.
7. Descuento de puntos.
8. Creación de `OrderItem`.
9. Vaciamiento del carrito.
10. Cambio de estados.

Las operaciones locales que deban ser atómicas se ejecutarán dentro de una transacción. Las llamadas externas al proveedor de pagos no deben mantenerse dentro de una transacción abierta durante un tiempo indefinido.

Si una operación externa confirma el pago pero falla una operación local, se debe utilizar idempotencia y un estado de compensación o reintento controlado.

## 10. Compras y pagos

### 10.1 Orders

`orders` será el dueño de:

- `Order`.
- `OrderItem`.
- Consulta del historial de compras.

`PurchaseHistory` deja de representar la compra como entidad principal. El historial se construirá consultando órdenes y sus items.

### 10.2 Estados de orden

```text
PENDING
CONFIRMED
CANCELLED
REFUNDED
```

### 10.3 Estados de pago

```text
PENDING
AUTHORIZED
PAID
FAILED
REFUNDED
```

Los estados de la orden y del pago no deben mezclarse.

### 10.4 Payments

`payments` será un feature con interfaces y providers intercambiables. El proveedor concreto aún no está definido.

```text
src/payments/
├── payments.module.ts
├── payments.service.ts
├── interfaces/
│   └── payment-provider.interface.ts
├── providers/
│   └── payment-provider.token.ts
├── dto/
└── types/
```

El módulo deberá permitir sustituir el proveedor sin modificar las reglas de negocio de `orders`.

## 11. Infraestructura

### 11.1 Entornos

Se documentarán cuatro entornos:

```text
local
test
staging
production
```

### 11.2 Variables de entorno

Variables mínimas:

```text
NODE_ENV
PORT
DATABASE_URL
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_NAME
DB_POOL_SIZE
JWT_ACCESS_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN
COOKIE_DOMAIN
COOKIE_SECURE
COOKIE_SAME_SITE
CSRF_SECRET
BCRYPT_SALT_ROUNDS
CAPTCHA_SECRET
MAIL_HOST
MAIL_PORT
MAIL_USER
MAIL_PASSWORD
MAIL_FROM
PAYMENT_PROVIDER
```

No todas las variables de conexión deben ser obligatorias simultáneamente. La configuración debe soportar `DATABASE_URL` o los parámetros individuales, con reglas claras de precedencia.

El arranque debe fallar si falta una variable obligatoria para el entorno actual.

Se mantendrá:

```text
.env.example
```

Nunca se deben versionar secretos reales.

### 11.3 Docker Compose

Estructura base:

```yaml
services:
  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER}"]
      interval: 5s
      retries: 10

  migrate:
    build: .
    command: npm run migration:run
    depends_on:
      postgres:
        condition: service_healthy
    restart: "no"

  api:
    build: .
    depends_on:
      migrate:
        condition: service_completed_successfully
    expose:
      - "3000"

  nginx:
    image: nginx:alpine
    depends_on:
      - api
    ports:
      - "80:80"
```

Para escalar:

```bash
docker compose up --scale api=2
```

Nginx será el punto de entrada y distribuirá tráfico entre las instancias de API.

### 11.4 Persistencia

Postgres utilizará un volumen con nombre. La producción debe incluir respaldos programados mediante `pg_dump` o el mecanismo equivalente del proveedor de infraestructura.

Debe existir documentación para:

- Crear un respaldo.
- Restaurar un respaldo.
- Verificar un respaldo.
- Restaurar en staging.
- Ejecutar migraciones después de restaurar.

### 11.5 Dockerfile

El Dockerfile será multi-stage:

1. Instalar dependencias.
2. Compilar TypeScript.
3. Instalar solo dependencias de producción.
4. Copiar `dist` y archivos necesarios.
5. Ejecutar con usuario no root.
6. Definir un comando de runtime explícito.

## 12. Health checks y observabilidad

### 12.1 Health checks

Se implementarán:

```text
GET /health/live
GET /health/ready
```

`live` verifica que el proceso esté ejecutándose. `ready` verifica que la aplicación pueda recibir tráfico y que PostgreSQL esté disponible.

Estos endpoints serán públicos, pero no deben exponer secretos ni información sensible.

### 12.2 Logs

Se utilizará Pino con logs estructurados.

Cada request debe poder correlacionarse mediante un identificador, por ejemplo:

```text
requestId
```

Los logs no deben incluir:

- Contraseñas.
- Tokens completos.
- Cookies completas.
- Secretos.
- Datos sensibles innecesarios.

Se recomienda registrar:

- Método y ruta.
- Código de respuesta.
- Duración.
- `requestId`.
- Usuario anonimizado o `userId` cuando sea seguro.
- Error normalizado.

## 13. Manejo de errores

La API utilizará un formato uniforme:

```json
{
  "statusCode": 409,
  "code": "SEAT_ALREADY_RESERVED",
  "message": "El asiento ya está reservado",
  "details": {},
  "timestamp": "2026-10-05T00:00:00.000Z",
  "path": "/api/v1/reservations"
}
```

Campos mínimos:

- `statusCode`.
- `code`.
- `message`.
- `details` cuando sea necesario.
- `timestamp`.
- `path`.

Se implementará un filtro global de excepciones. Los errores internos no deben revelar SQL, secretos, stack traces o detalles de infraestructura en producción.

Códigos iniciales recomendados:

```text
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
AUTH_TOKEN_REVOKED
AUTH_CSRF_INVALID
FORBIDDEN_ROLE
RESOURCE_NOT_FOUND
VALIDATION_ERROR
SEAT_ALREADY_RESERVED
CART_EXPIRED
ORDER_ALREADY_PROCESSED
PAYMENT_FAILED
INSUFFICIENT_POINTS
INTERNAL_ERROR
```

## 14. Paginación y respuestas REST

La estrategia se decide por endpoint:

- `page` y `limit` para catálogos y listados administrativos.
- `offset` y `limit` solo cuando exista dependencia del frontend actual.
- Cursor pagination para listados grandes o feeds.
- Cada endpoint debe documentar su estrategia en Swagger.

Respuesta recomendada para listados con página:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Las respuestas no deben copiar mecánicamente el formato de Express si ese formato contradice una API REST clara o las convenciones de NestJS.

## 15. Swagger y validación

`main.ts` debe configurar:

- `ValidationPipe` global.
- `whitelist: true`.
- `forbidNonWhitelisted: true`.
- `transform: true`.
- Swagger/OpenAPI.
- Versionamiento URI.
- Serialización de errores.

Los DTOs utilizarán `class-validator` y `class-transformer`.

Ejemplo de configuración esperada:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

Las rutas protegidas deberán documentar la autenticación basada en cookies y CSRF cuando aplique.

## 16. Calidad y CI/CD

### 16.1 Herramientas

- Jest.
- Supertest.
- ESLint.
- Prettier.
- TypeScript en modo estricto cuando sea viable.
- TypeORM CLI.
- Docker.

### 16.2 Pipeline de pull request

Cada pull request hacia `develop` debe ejecutar:

1. Instalación reproducible.
2. Verificación de tipos.
3. ESLint.
4. Prettier check.
5. Pruebas unitarias.
6. Pruebas de integración.
7. Cobertura.
8. Build de NestJS.
9. Build de imagen Docker cuando corresponda.

### 16.3 Cobertura

Umbrales bloqueantes:

```text
Global: 40 %
auth: 70 %
reservations: 70 %
orders: 70 %
```

La cobertura no reemplaza la calidad de las pruebas. Las reglas de negocio críticas deben tener casos positivos, negativos, límites e idempotencia.

### 16.4 Pruebas unitarias

Se deben probar:

- `AuthGuard`.
- `RolesGuard`.
- Decoradores y resoluciones de metadata.
- Services de autenticación.
- Rotación de refresh tokens.
- Validación de roles.
- Reservas.
- Expiración perezosa.
- Carrito.
- Checkout.
- Providers de pago mediante mocks.
- Manejo de errores.

### 16.5 Pruebas de integración

Se deben probar:

- Repositories contra PostgreSQL de prueba.
- Migraciones.
- Restricciones únicas.
- Índice único de rol por defecto.
- Transacciones.
- Inserción de asientos.
- Seeders idempotentes.

### 16.6 Pruebas E2E

Flujos mínimos:

- Registro.
- Verificación de email.
- Login.
- Acceso con cookie.
- Protección CSRF.
- Refresh token.
- Logout.
- Acceso por rol.
- Catálogo.
- Reserva.
- Carrito.
- Checkout.
- Orden.
- Historial de compras.

### 16.7 Pruebas de concurrencia

Debe levantarse un entorno real con:

- Dos instancias de API.
- Una base de datos compartida.
- Dos clientes intentando reservar el mismo asiento.
- Solicitudes simultáneas.

Criterios:

- Solo una reserva puede adquirir el asiento vigente.
- La otra solicitud recibe conflicto.
- No quedan datos parcialmente confirmados.
- Las transacciones se revierten cuando corresponde.
- El resultado es consistente sin importar la instancia que atienda cada request.

## 17. Orden de implementación

### Fase 1: base técnica

- Crear repositorio nuevo.
- Inicializar NestJS.
- Configurar TypeScript.
- Configurar ConfigModule.
- Validar variables de entorno.
- Configurar TypeORM.
- Crear `data-source.ts`.
- Configurar Dockerfile.
- Configurar Docker Compose.
- Crear servicios `postgres`, `migrate`, `api` y `nginx`.
- Configurar ESLint, Prettier y Jest.
- Crear CI inicial.
- Crear health checks básicos.

### Fase 2: inventario e infraestructura de datos

- Leer `app/src/models`.
- Completar inventario de entidades.
- Confirmar tablas y columnas.
- Crear copia de la base.
- Validar conexión de solo lectura.
- Documentar discrepancias.
- Definir migraciones necesarias.

### Fase 3: seguridad y usuarios

- Crear `common/`.
- Crear decorators `@Roles`, `@Public` y `@CurrentUser`.
- Crear `AuthGuard`.
- Crear `RolesGuard`.
- Implementar `users`.
- Implementar `Role`.
- Implementar `Profile`.
- Implementar cookies.
- Implementar CSRF.
- Implementar `auth`.
- Implementar refresh rotation.
- Implementar LoginAudit.
- Habilitar escrituras de usuarios y autenticación después de E2E.

### Fase 4: catálogo

- Implementar `locations`.
- Implementar `cinemas`.
- Implementar `movies`.
- Implementar `showtimes`.
- Crear consultas de cartelera.
- Validar relaciones.
- Habilitar escrituras de catálogo.

### Fase 5: reservas y snacks

- Implementar `reservations`.
- Implementar `ReservationSeat`.
- Implementar concurrencia de asientos.
- Implementar expiración perezosa.
- Implementar `snacks`.
- Crear pruebas de integración.

### Fase 6: carrito y pagos

- Implementar `cart`.
- Definir contratos de `payments`.
- Implementar provider mock.
- Definir flujo de pago pendiente y confirmado.
- Probar idempotencia.

### Fase 7: órdenes y loyalty

- Implementar `Order`.
- Implementar `OrderItem`.
- Implementar historial de compras.
- Implementar `Membership` y `BonusWallet`.
- Integrar descuento de puntos.
- Completar checkout transaccional.

### Fase 8: notificaciones

- Implementar preferencias.
- Implementar notificaciones de próximas películas.
- Integrar correo y eventos necesarios.

### Fase 9: endurecimiento

- Ejecutar pruebas de concurrencia con dos instancias.
- Revisar pool de conexiones.
- Validar límites de Postgres.
- Probar restauración de respaldo.
- Probar rollback de despliegue.
- Ejecutar pruebas de carga básicas.
- Revisar logs y health checks.
- Aprobar cambio de tráfico.

## 18. Infraestructura multi-instancia

### 18.1 API sin estado

La API no debe guardar estado de negocio en memoria del proceso.

No se utilizarán como fuente de verdad:

- Sesiones en memoria.
- Contadores en memoria.
- Cache local para disponibilidad de asientos.
- Listas de usuarios autenticados en memoria.
- Locks locales del proceso.

Toda la información necesaria para resolver una solicitud debe vivir en PostgreSQL o en un sistema externo compartido aprobado.

### 18.2 JWT

Todas las instancias deben compartir la misma configuración de firma de JWT. Los secretos deben venir de variables de entorno o de un gestor de secretos, nunca de archivos locales versionados.

### 18.3 Pool de conexiones

El cálculo debe cumplir:

```text
pool_por_instancia × número_de_instancias
< conexiones_disponibles_de_Postgres
```

También deben reservarse conexiones para:

- Migraciones.
- Administración.
- Health checks.
- Conexiones de mantenimiento.

### 18.4 Migraciones

Las migraciones no se ejecutan desde cada instancia de API. Se ejecutan mediante el servicio `migrate`, que termina al finalizar.

En producción, la ejecución requerirá aprobación manual y un respaldo previo cuando el cambio tenga riesgo sobre datos existentes.

## 19. Criterios de aceptación

La migración se considerará lista cuando:

- Todas las entidades hayan sido contrastadas con `app/src/models`.
- La aplicación arranque con configuración validada.
- `synchronize` esté desactivado.
- Las migraciones se ejecuten fuera de la API.
- Los seeders sean idempotentes.
- La API responda con `/api/v1`.
- Las rutas públicas funcionen con `@Public()`.
- Las rutas protegidas requieran cookie válida.
- CSRF bloquee solicitudes mutables inválidas.
- La rotación de refresh tokens funcione.
- La reutilización de refresh tokens sea detectada.
- Los roles restrinjan endpoints correctamente.
- Los usuarios tengan un solo rol.
- La expiración perezosa funcione.
- Dos instancias no puedan vender el mismo asiento.
- El checkout sea idempotente.
- Los estados de orden y pago estén separados.
- Los puntos no se descuenten antes de confirmar el pago.
- Existan health checks de live y ready.
- Los logs no expongan secretos.
- La cobertura global sea mínimo 40 %.
- `auth`, `reservations` y `orders` alcancen 70 %.
- CI pase lint, formato, pruebas, cobertura y build.
- Exista un procedimiento de backup y restore probado.
- Exista un procedimiento de rollback.

## 20. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La descripción no coincide con Sequelize | Alto | Inventario obligatorio antes de crear entidades |
| Migración destructiva accidental | Alto | `synchronize: false`, revisión y backup |
| Cookies mal configuradas | Alto | Pruebas por entorno y CSRF explícito |
| Reutilización de refresh token | Alto | Rotación, hash y revocación de familia |
| Doble reserva de asiento | Alto | Restricción única, transacción y prueba multi-instancia |
| Proveedor de pagos no definido | Alto | Interface y provider intercambiable |
| Pool agotado | Medio | Calcular pool total según número de instancias |
| Migraciones concurrentes | Alto | Servicio `migrate` único y aprobación |
| Acumulación de filas vencidas | Medio | Comando o limpieza futura independiente |
| Diferencias de respuestas REST | Medio | Documentar contratos y pruebas E2E |
| Pérdida de historial de compras | Alto | `Order` y `OrderItem` como fuente histórica |
| Puntos descontados dos veces | Alto | Idempotencia y transacciones |
| Logs con información sensible | Alto | Pino con redacción de cookies y tokens |

## 21. Decisiones futuras

Las siguientes decisiones no bloquean la primera implementación, pero deberán documentarse cuando sean necesarias:

- Proveedor de pagos.
- Tiempo exacto de expiración de access token.
- Tiempo exacto de expiración de refresh token.
- Porcentaje de tráfico inicial hacia NestJS.
- Estrategia definitiva de rollback.
- Limpieza de filas vencidas.
- Integración con correo concreta.
- Integración de captcha concreta.
- Sistema de permisos configurable.
- Soporte para múltiples roles.
- Métricas y tracing distribuidos.
- Política de rotación de secretos.

## 22. Registro de cambios

| Versión | Fecha | Cambio | Responsable |
|---|---|---|---|
| 0.1.0 | 2026-10-05 | Plan inicial consolidado y decisiones de arquitectura | Equipo Riwi Cine |
| 0.2.0 | 2026-10-05 | Se agregaron pagos, cookies, CSRF, versionamiento URI, CI y criterios de aceptación | Equipo Riwi Cine |

## 23. Próxima acción obligatoria

Antes de crear las entidades TypeORM, completar el inventario de `app/src/models` y validar cada tabla contra una copia de PostgreSQL.

El primer entregable técnico debe ser:

```text
docs/database-inventory.md
```

Ese archivo debe contener la correspondencia entre modelos Sequelize, tablas actuales y entidades TypeORM propuestas. Ninguna migración estructural debe ejecutarse hasta que ese inventario sea revisado y aprobado.

</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-05T13:50:00-05:00.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.8 Flash (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>