// src/modules/locations/locations.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity.js';
import { Country } from './entities/country.entity.js';
import { Department } from './entities/department.entity.js';
import { LocationsController } from './locations.controller.js';
import { LocationsService } from './locations.service.js';
import { CountryDao } from './dao/country.dao.js';
import { DepartmentDao } from './dao/department.dao.js';
import { CityDao } from './dao/city.dao.js';
import { CountryMapper } from './mappers/country.mapper.js';
import { DepartmentMapper } from './mappers/department.mapper.js';
import { CityMapper } from './mappers/city.mapper.js';

@Module({
  imports: [TypeOrmModule.forFeature([Country, Department, City])],
  controllers: [LocationsController],
  providers: [
    LocationsService,
    CountryDao,
    DepartmentDao,
    CityDao,
    CountryMapper,
    DepartmentMapper,
    CityMapper,
  ],
  exports: [
    LocationsService,
    CountryDao,
    DepartmentDao,
    CityDao,
    CountryMapper,
    DepartmentMapper,
    CityMapper,
  ],
})
export class LocationsModule {}
