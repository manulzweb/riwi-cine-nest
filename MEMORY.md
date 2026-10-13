# Riwi Cine Backend & Frontend - Memory & System State Tracker (MEMORY.md)
> **Bitácora Dinámica de Memoria y Estado del Sistema**  
> Este archivo sirve como memoria viva para registrar el progreso, decisiones de diseño, cambios en la API, descubrimientos técnicos y el estado de implementación de cada módulo.

---

## 1. Estado Actual del Sistema (Dashboard)

- **Última Actualización:** 2026-10-13 12:25 UTC-5
- **Estado General:** Backend con módulo de Reservaciones completo y probado (71/71 tests unitarios). Frontend verificado con las 4 Reglas de Oro (credentials, CSRF x-csrf-token, /cinemas/rooms/:roomId/seats y manejo estándar de errores) con 9/9 tests pasando.
- **Suite de Pruebas Backend:** 71 pasadas / 0 fallidas (100% éxito)
- **Suite de Pruebas Frontend:** 9 pasadas / 0 fallidas (100% éxito)
- **Suite E2E:** `test/auth.e2e-spec.ts`, `test/catalog.e2e-spec.ts` operativos.

---

## 2. Matriz de Progreso por Módulo

| Módulo | Entidades | DAOs | Mappers | DTOs | Service | Controller | Tests Unit | Tests E2E | Estado |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Health** | N/A | N/A | N/A | N/A | ✅ | ✅ | ✅ | ✅ | Completo |
| **Auth** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Completo |
| **Users** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Completo |
| **Locations** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | Completo (Rutas) |
| **Cinemas** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | Completo (Rutas) |
| **Movies** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | Completo (Rutas) |
| **Showtimes** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | Completo (Rutas) |
| **Reservations** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ | Completo (Rutas y Lógica) |
| **Frontend (Web)**| N/A | N/A | N/A | ✅ | ✅ | ✅ | ✅ | ⏳ | Completo (SPA React + Vite) |
| **Cart** | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | Persistencia Lista |
| **Orders** | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | Persistencia Lista |
| **Snacks** | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | Persistencia Lista |
| **Loyalty** | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | Persistencia Lista |
| **Notifications** | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | Persistencia Lista |

*Convenciones: ✅ = Implementado y probado | ⏳ = Pendiente / En desarrollo*

---

## 3. Decisiones Técnicas y Convenciones Establecidas

1. **Autenticación e Identidad:**
   - Tokens transmitidos preferentemente vía cookies HttpOnly (`riwi_access_token`, `riwi_refresh_token`).
   - Soporte fallback para cabecera `Authorization: Bearer <token>`.
   - Rotación estricta de Refresh Token: el reuso de un token ya consumido revoca automáticamente todos los tokens del usuario.
2. **Protección CSRF:**
   - Middleware `csurf` configurado a nivel de aplicación Express.
   - Requiere cabecera `x-csrf-token` y cookie `riwi_csrf_token`.
   - El cliente frontend sincroniza el token CSRF mediante `GET /api/v1/auth/csrf` y lo adjunta en toda mutación (POST, PUT, DELETE).
3. **Control de Acceso (RBAC):**
   - `@Public()` para endpoints abiertos.
   - `@Roles('admin', 'super_admin')` para endpoints con privilegios de gestión.
   - Por defecto, cualquier ruta sin `@Public()` exige sesión válida.
4. **Patrón de Capas Backend:**
   - `BaseDao<T>` encapsula consultas de TypeORM.
   - `BaseMapper<Entity, DTO>` aísla el acoplamiento entre la BD y la API.
5. **Manejo de Reservas Concurrentes y TTL:**
   - Transacción atómica en PostgreSQL que valida disponibilidad de butacas (`findLockedOrSoldSeatIds`) antes de persistir.
   - TTL de 10 minutos para liberación automática de bloqueos no confirmados.
6. **Frontend Arquitectura y Accesibilidad (a11y):**
   - React 19 + TypeScript + Vite + TailwindCSS.
   - Interfaz con paleta cinematográfica oscura, alto contraste y anillos de foco visibles (`focus-visible`).
   - Navegación por teclado (Flechas/Tab y Enter/Espacio) en el mapa de butacas (`SeatMap`).
   - Anuncios en vivo para lectores de pantalla (`aria-live="polite"` y `role="alert"`).
   - Temporizador dinámico de cuenta regresiva (`ReservationTimer`) y generador de tickets imprimibles (`TicketSummary`).
   - Configuración Dockerfile multi-stage con Nginx y SPA routing fallback.

---

## 4. Bitácora de Cambios y Descubrimientos (Changelog de Aprendizaje)

### [2026-10-13]
- **Auditoría Inicial Completada:**
  - Se mapearon 24 entidades en TypeORM y 7 controladores activos.
  - Se crearon los archivos de memoria base: `AGENTS.md` y `MEMORY.md`.
- **Implementación del Módulo de Reservas Backend (`Reservations`):**
  - Se crearon `CreateReservationDto`, `ReservationResponseDto`.
  - Se implementó `ReservationsService` con control transaccional concurrente, TTL de 10m y cálculo dinámico de tarifas según tipo de asiento.
  - Se expuso `ReservationsController` con rutas para bloqueo, consulta de asientos en tiempo real, confirmación, listado personal y cancelación.
  - Se escribieron 7 pruebas unitarias en Vitest (71 tests totales en backend pasando).
- **Construcción Completa del Frontend (`/frontend`):**
  - Inicialización con React 19, TypeScript, Vite, TailwindCSS y Lucide Icons.
  - Implementación de cliente API con manejo transparente de cookies HttpOnly (`credentials: 'include'`), sincronización de token CSRF (`x-csrf-token`), y rotación automática ante respuestas 401.
  - Creación de contextos globales: `AuthContext` (gestión de sesión, login, registro, logout) y `NotificationContext` (toasts accesibles con regiones ARIA).
  - Componente de Mapa de Butacas interactivo (`SeatMap`) con pantalla curva, distinción de butacas (General, Preferencial, VIP), estados en tiempo real (Disponible, Seleccionada, Bloqueada, Vendida), navegación por teclado y soporte para lectores de pantalla.
  - Componente `ReservationTimer` con cuenta regresiva de 10m, barra de progreso y alerta de urgencia a los 2 minutos.
  - Vistas completas: `BillboardPage` (cartelera con filtros por ciudad, formato y género), `BookingPage` (reserva y selección interactiva en tiempo real) y `MyReservationsPage` (historial, confirmaciones y tickets con código QR).
  - Suite de pruebas unitarias de frontend con Vitest y Testing Library (8/8 pruebas exitosas).
- **Corrección de Dependencia Circular en Entidades (ESM Runtime Crash):**
  - Se diagnosticó `502 Bad Gateway` en `https://riwi.manulz.dev/api`. El contenedor `app-cine-stack-api-1` fallaba en bucle con:
    `ReferenceError: Cannot access 'User' before initialization at refresh-token.entity.js` debido a metadatos de reflexión (`emitDecoratorMetadata`) generados por relaciones cíclicas en módulos ES nativos.
  - Se implementó `import { type Relation } from 'typeorm'` en todas las entidades con relaciones (`user: Relation<User>`), eliminando la emisión en tiempo de ejecución del constructor en los metadatos y restaurando el arranque correcto del backend.
- **Arquitectura Multi-App con Nginx Proxy Manager (NPM):**
  - Se adaptó `docker-compose.yml` para prescindir de proxies Nginx redundantes locales en el host de `apps`.
  - La API NestJS expone directamente al host en el puerto `3000` (`${API_PORT:-3000}:3000`).
  - Se incorporó el servicio `frontend` con build context apuntando a `./frontend` exponiendo en el puerto `3001` (`${FRONTEND_PORT:-3001}:80`).
  - El enrutamiento de dominio único (`riwi.manulz.dev` con raíz `/` para frontend y `/api` para backend) se delega a Custom Locations en NPM externo vía red privada.
- **Creación de Skill `npm-multiapp-deploy`:**
  - Se creó la skill persistente en `~/.gemini/config/skills/npm-multiapp-deploy/SKILL.md` y `~/.agents/skills/npm-multiapp-deploy/SKILL.md` para estandarizar este flujo de despliegue en proyectos hermanos (e.g. surebets).

---

## 5. Próximos Pasos Prioritarios

1. **Integración con Carrito y Dulcería (`Cart` & `Snacks`):**
   - Exponer endpoints de confitería y asociar productos al flujo de compra previo al pago final.
2. **Historial de Órdenes y Checkout (`Orders`):**
   - Transicionar reservas confirmadas hacia `PurchaseHistory` y pasarela de pago.
