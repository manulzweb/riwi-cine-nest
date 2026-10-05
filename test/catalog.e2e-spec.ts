// test/catalog.e2e-spec.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';
import { Profile } from '../src/modules/users/entities/profile.entity';
import { Cinema } from '../src/modules/cinemas/entities/cinema.entity';
import { Room } from '../src/modules/cinemas/entities/room.entity';
import { Movie } from '../src/modules/movies/entities/movie.entity';

describe('Catalog Module (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let profileRepo: Repository<Profile>;
  let cinemaRepo: Repository<Cinema>;
  let roomRepo: Repository<Room>;
  let movieRepo: Repository<Movie>;

  let adminCookies: string[] = [];
  let csrfToken: string = '';
  let testCinemaId: number;
  let testRoomId: number;
  let testMovieId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1', {
      exclude: ['health', 'health/(.*)'],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    userRepo = app.get(getRepositoryToken(User));
    profileRepo = app.get(getRepositoryToken(Profile));
    cinemaRepo = app.get(getRepositoryToken(Cinema));
    roomRepo = app.get(getRepositoryToken(Room));
    movieRepo = app.get(getRepositoryToken(Movie));

    // Ensure an admin user exists for testing protected endpoints
    const adminEmail = 'admin_catalog_e2e@riwicine.com';
    let admin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const passwordHash = await bcrypt.hash('AdminPassword123!', 10);
      admin = userRepo.create({
        email: adminEmail,
        passwordHash,
        roleId: 2, // Admin role
        isActive: true,
        emailVerifiedAt: new Date(),
        personalDataConsent: true,
        termsConsent: true,
      });
      admin = await userRepo.save(admin);

      const profile = profileRepo.create({
        userId: admin.id,
        firstName: 'Admin',
        lastName: 'E2E',
        documentType: 'CC',
        documentNumber: '99887766',
        birthDate: '1990-01-01',
        phone: '3109998877',
      });
      await profileRepo.save(profile);
    }

    // Login as admin to get auth cookies & CSRF token
    const csrfRes = await request(app.getHttpServer()).get('/api/v1/auth/csrf');
    const csrfCookie = csrfRes.headers['set-cookie'] as unknown as string[];
    csrfToken = csrfRes.body.csrfToken;

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Cookie', csrfCookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: adminEmail,
        password: 'AdminPassword123!',
      })
      .expect(200);

    const loginCookies = loginRes.headers['set-cookie'] as unknown as string[];
    adminCookies = [...csrfCookie, ...loginCookies];

    // Grab seeded records for testing
    const seededCinema = await cinemaRepo.findOne({
      where: { isActive: true },
    });
    if (seededCinema) testCinemaId = seededCinema.id;

    const seededRoom = await roomRepo.findOne({ where: { isActive: true } });
    if (seededRoom) testRoomId = seededRoom.id;

    const seededMovie = await movieRepo.findOne({ where: { isActive: true } });
    if (seededMovie) testMovieId = seededMovie.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Locations
  describe('Locations Endpoints', () => {
    it('GET /api/v1/locations/countries -> debe listar países (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/locations/countries')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
    });

    it('GET /api/v1/locations/departments -> debe listar departamentos (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/locations/departments')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/locations/cities -> debe listar ciudades (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/locations/cities')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // 2. Cinemas
  describe('Cinemas Endpoints', () => {
    it('GET /api/v1/cinemas -> debe listar cines activos (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cinemas')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('address');
    });

    it('GET /api/v1/cinemas/seat-types -> debe listar tipos de asiento (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cinemas/seat-types')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/cinemas/:id -> debe retornar detalle del cine con salas (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/cinemas/${testCinemaId}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', testCinemaId);
      expect(res.body).toHaveProperty('rooms');
      expect(Array.isArray(res.body.rooms)).toBe(true);
    });

    it('GET /api/v1/cinemas/rooms/:roomId/seats -> debe retornar mapa de asientos de la sala', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/cinemas/rooms/${testRoomId}/seats`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('row');
      expect(res.body[0]).toHaveProperty('number');
      expect(res.body[0]).toHaveProperty('seatType');
    });

    it('POST /api/v1/cinemas sin auth -> debe retornar 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/cinemas')
        .send({ name: 'Cine Sin Auth', address: 'Calle 0' })
        .expect(401);
    });

    it('POST /api/v1/cinemas con Admin -> debe crear cine exitosamente', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cinemas')
        .set('Cookie', adminCookies)
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: `Cine E2E ${Date.now()}`,
          address: 'Avenida Siempre Viva 742',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.isActive).toBe(true);
    });
  });

  // 3. Movies
  describe('Movies Endpoints', () => {
    it('GET /api/v1/movies -> debe retornar películas paginadas (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/movies?page=1&limit=5')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('GET /api/v1/movies/premieres -> debe retornar estrenos (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/movies/premieres')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/v1/movies/:id -> debe retornar detalle de película (Público)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/movies/${testMovieId}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', testMovieId);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('synopsis');
    });

    it('POST /api/v1/movies con Admin -> debe crear nueva película', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/movies')
        .set('Cookie', adminCookies)
        .set('X-CSRF-Token', csrfToken)
        .send({
          title: `Película E2E ${Date.now()}`,
          synopsis: 'Sinopsis de prueba para la película E2E de catálogo',
          director: 'Director E2E',
          duration: 135,
          classification: 'PG-13',
          releaseDate: '2026-11-20',
          posterUrl: 'https://images.tmdb.org/t/p/w500/sample.jpg',
          genres: ['Acción', 'Sci-Fi'],
          formats: ['2D', 'IMAX'],
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toContain('Película E2E');
      expect(res.body.isActive).toBe(true);
    });
  });

  // 4. Showtimes & Billboard
  describe('Showtimes & Billboard Endpoints', () => {
    it('GET /api/v1/showtimes/billboard -> debe retornar cartelera agrupada por película', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/showtimes/billboard')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('movie');
        expect(res.body[0]).toHaveProperty('showtimes');
        expect(Array.isArray(res.body[0].showtimes)).toBe(true);
      }
    });

    it('GET /api/v1/showtimes -> debe listar funciones activas', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/showtimes')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/showtimes con horario válido -> debe crear función exitosamente', async () => {
      // Programamos una función en un horario dinámico único para evitar colisiones entre ejecuciones
      const offsetDays = 30 + Math.floor(Math.random() * 1000);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + offsetDays);
      futureDate.setHours(10, Math.floor(Math.random() * 50), 0, 0);

      const res = await request(app.getHttpServer())
        .post('/api/v1/showtimes')
        .set('Cookie', adminCookies)
        .set('X-CSRF-Token', csrfToken)
        .send({
          movieId: testMovieId,
          roomId: testRoomId,
          startTime: futureDate.toISOString(),
          price: 18000,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.roomId).toBe(testRoomId);
      expect(res.body.totalSeats).toBeGreaterThan(0);
      expect(res.body.availableSeats).toBe(res.body.totalSeats);

      // 5. Overlap Validation
      // Intento de solapamiento en la misma sala 30 minutos después
      const overlappingDate = new Date(futureDate.getTime() + 30 * 60 * 1000);
      const overlapRes = await request(app.getHttpServer())
        .post('/api/v1/showtimes')
        .set('Cookie', adminCookies)
        .set('X-CSRF-Token', csrfToken)
        .send({
          movieId: testMovieId,
          roomId: testRoomId,
          startTime: overlappingDate.toISOString(),
          price: 20000,
        })
        .expect(409);

      expect(overlapRes.body.code).toBe('SHOWTIME_ROOM_OVERLAP');
    });
  });
});
