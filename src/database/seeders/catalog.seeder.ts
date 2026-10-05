// src/database/seeders/catalog.seeder.ts

import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Country } from '../../modules/locations/entities/country.entity';
import { Department } from '../../modules/locations/entities/department.entity';
import { City } from '../../modules/locations/entities/city.entity';
import { Cinema } from '../../modules/cinemas/entities/cinema.entity';
import { Room } from '../../modules/cinemas/entities/room.entity';
import { SeatType } from '../../modules/cinemas/entities/seat-type.entity';
import { Seat } from '../../modules/cinemas/entities/seat.entity';
import { Movie } from '../../modules/movies/entities/movie.entity';
import { CinemaFunction } from '../../modules/showtimes/entities/cinema-function.entity';

export async function seedCatalog(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting Catalog Seeding...');

  const dataPath = path.join(__dirname, 'data', 'seed-cine.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Seed file not found at: ${dataPath}`);
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const countryRepo = dataSource.getRepository(Country);
  const deptRepo = dataSource.getRepository(Department);
  const cityRepo = dataSource.getRepository(City);
  const cinemaRepo = dataSource.getRepository(Cinema);
  const roomRepo = dataSource.getRepository(Room);
  const seatTypeRepo = dataSource.getRepository(SeatType);
  const seatRepo = dataSource.getRepository(Seat);
  const movieRepo = dataSource.getRepository(Movie);
  const functionRepo = dataSource.getRepository(CinemaFunction);

  // 1. Countries
  const countryMap = new Map<string, Country>();
  for (const c of rawData.countries || []) {
    let country = await countryRepo
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:name)', { name: c.name })
      .getOne();

    if (!country) {
      country = countryRepo.create({ name: c.name, isActive: true });
      country = await countryRepo.save(country);
      console.log(`  + Country: ${country.name}`);
    }
    countryMap.set(c.name.toLowerCase(), country);
  }

  // 2. Departments
  const deptMap = new Map<string, Department>();
  for (const d of rawData.departments || []) {
    const country = countryMap.get(d.countryName.toLowerCase());
    if (!country) continue;

    let dept = await deptRepo
      .createQueryBuilder('d')
      .where('LOWER(d.name) = LOWER(:name) AND d.countryId = :countryId', {
        name: d.name,
        countryId: country.id,
      })
      .getOne();

    if (!dept) {
      dept = deptRepo.create({
        name: d.name,
        countryId: country.id,
        isActive: true,
      });
      dept = await deptRepo.save(dept);
      console.log(`  + Department: ${dept.name}`);
    }
    deptMap.set(d.name.toLowerCase(), dept);
  }

  // 3. Cities
  const cityMap = new Map<string, City>();
  for (const ci of rawData.cities || []) {
    const dept = deptMap.get(ci.departmentName.toLowerCase());
    if (!dept) continue;

    let city = await cityRepo
      .createQueryBuilder('c')
      .where(
        'LOWER(c.name) = LOWER(:name) AND c.departmentId = :departmentId',
        {
          name: ci.name,
          departmentId: dept.id,
        },
      )
      .getOne();

    if (!city) {
      city = cityRepo.create({
        name: ci.name,
        departmentId: dept.id,
        isActive: true,
      });
      city = await cityRepo.save(city);
      console.log(`  + City: ${city.name}`);
    }
    cityMap.set(ci.name.toLowerCase(), city);
  }

  // 4. Cinemas
  const cinemaMap = new Map<string, Cinema>();
  for (const cin of rawData.cinemas || []) {
    const city = cityMap.get(cin.cityName.toLowerCase());

    let cinema = await cinemaRepo
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:name)', { name: cin.name })
      .getOne();

    if (!cinema) {
      cinema = cinemaRepo.create({
        name: cin.name,
        address: cin.address,
        cityId: city ? city.id : null,
        isActive: true,
      });
      cinema = await cinemaRepo.save(cinema);
      console.log(`  + Cinema: ${cinema.name}`);
    }
    cinemaMap.set(cin.name.toLowerCase(), cinema);
  }

  // 5. Rooms
  const roomList: Room[] = [];
  for (const r of rawData.rooms || []) {
    const cinema = cinemaMap.get(r.cinemaName.toLowerCase());
    if (!cinema) continue;

    let room = await roomRepo
      .createQueryBuilder('room')
      .where('LOWER(room.name) = LOWER(:name) AND room.cinemaId = :cinemaId', {
        name: r.name,
        cinemaId: cinema.id,
      })
      .getOne();

    if (!room) {
      room = roomRepo.create({
        name: r.name,
        cinemaId: cinema.id,
        format: r.format,
        capacity: r.capacity,
        isActive: true,
      });
      room = await roomRepo.save(room);
      console.log(`  + Room: ${room.name} (${cinema.name})`);
    }
    roomList.push(room);
  }

  // 6. Seat Types
  const seatTypeMap = new Map<string, SeatType>();
  for (const st of rawData.seatTypes || []) {
    let seatType = await seatTypeRepo.findOne({ where: { name: st.name } });
    if (!seatType) {
      seatType = seatTypeRepo.create({
        name: st.name,
        description: st.description,
        priceFactor: Number(st.priceFactor).toFixed(2),
      });
      seatType = await seatTypeRepo.save(seatType);
      console.log(`  + SeatType: ${seatType.name}`);
    }
    seatTypeMap.set(st.name.toLowerCase(), seatType);
  }

  const generalSeatType =
    seatTypeMap.get('general') || (await seatTypeRepo.findOne({ where: {} }));
  const preferencialSeatType =
    seatTypeMap.get('preferencial') || generalSeatType;
  const vipSeatType = seatTypeMap.get('vip') || preferencialSeatType;

  // 7. Seats for each Room
  for (const room of roomList) {
    const seatCount = await seatRepo.count({ where: { roomId: room.id } });
    if (seatCount === 0 && generalSeatType) {
      const rows = 6; // Rows A to F
      const seatsPerRow = Math.min(Math.ceil(room.capacity / rows), 15);
      const seatsToInsert: Seat[] = [];

      for (let r = 0; r < rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        let currentType = generalSeatType;
        if (r >= 2 && r < 4 && preferencialSeatType) {
          currentType = preferencialSeatType;
        } else if (r >= 4 && vipSeatType) {
          currentType = vipSeatType;
        }

        for (let n = 1; n <= seatsPerRow; n++) {
          seatsToInsert.push(
            seatRepo.create({
              roomId: room.id,
              seatTypeId: currentType.id,
              row: rowLetter,
              number: n,
              isAvailable: true,
              isActive: true,
            }),
          );
        }
      }

      await seatRepo.save(seatsToInsert, { chunk: 100 });
      room.capacity = seatsToInsert.length;
      await roomRepo.save(room);
      console.log(
        `  + Generated ${seatsToInsert.length} seats for room: ${room.name}`,
      );
    }
  }

  // 8. Movies
  const movieList: Movie[] = [];
  for (const m of rawData.movies || []) {
    let movie = await movieRepo
      .createQueryBuilder('m')
      .where('LOWER(m.title) = LOWER(:title)', { title: m.title })
      .getOne();

    if (!movie) {
      movie = movieRepo.create({
        title: m.title,
        synopsis: m.synopsis,
        director: m.director,
        actors: m.actors || [],
        genres: m.genres || [],
        languages: m.languages || ['Español'],
        formats: m.formats || ['2D'],
        duration: m.duration,
        classification: m.rating || 'PG-13',
        releaseDate: m.releaseDate,
        posterUrl: m.posterUrl,
        bannerUrl: m.bannerUrl || null,
        trailerUrl: m.trailerUrl || null,
        genre: m.genre || (m.genres ? m.genres[0] : 'Acción'),
        language: m.languages ? m.languages[0] : 'Español',
        isSubtitled: false,
        rating: 0,
        averageRating: '0.0',
        active: true,
        isActive: true,
      });
      movie = await movieRepo.save(movie);
      console.log(`  + Movie: ${movie.title}`);
    }
    movieList.push(movie);
  }

  // 9. Showtimes (CinemaFunctions)
  const existingFunctionsCount = await functionRepo.count();
  if (
    existingFunctionsCount === 0 &&
    movieList.length > 0 &&
    roomList.length > 0
  ) {
    console.log('  + Creating initial billboard showtimes...');
    const now = new Date();
    const times = [
      { hour: 14, min: 0 },
      { hour: 17, min: 30 },
      { hour: 21, min: 0 },
    ];

    // Schedule across 3 days
    for (let day = 0; day < 3; day++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + day);

      for (let i = 0; i < Math.min(movieList.length, 4); i++) {
        const movie = movieList[i];
        const room = roomList[i % roomList.length];
        const timeSlot = times[i % times.length];

        const startTime = new Date(targetDate);
        startTime.setHours(timeSlot.hour, timeSlot.min, 0, 0);

        const endTime = new Date(
          startTime.getTime() + (movie.duration + 20) * 60 * 1000,
        );

        let price = 15000;
        if (room.format === '3D') price = 20000;
        if (room.format === 'IMAX') price = 28000;
        if (room.format === 'VIP') price = 32000;

        const fn = functionRepo.create({
          movieId: movie.id,
          roomId: room.id,
          startTime,
          endTime,
          price,
          format: room.format,
          room: room.name,
          totalSeats: room.capacity,
          availableSeats: room.capacity,
          active: true,
          isActive: true,
        });

        await functionRepo.save(fn);
      }
    }
    console.log('  + Initial showtimes seeded successfully');
  }

  console.log('✅ Catalog seeding completed successfully!');
}
