// src/modules/locations/locations.service.ts

import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto.js';
import { CreateCountryDto } from './dto/create-country.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { CountryResponseDto } from './dto/country-response.dto.js';
import { DepartmentResponseDto } from './dto/department-response.dto.js';
import { CityResponseDto } from './dto/city-response.dto.js';
import { CountryDao } from './dao/country.dao.js';
import { DepartmentDao } from './dao/department.dao.js';
import { CityDao } from './dao/city.dao.js';
import { CountryMapper } from './mappers/country.mapper.js';
import { DepartmentMapper } from './mappers/department.mapper.js';
import { CityMapper } from './mappers/city.mapper.js';

@Injectable()
export class LocationsService {
  constructor(
    private readonly countryDao: CountryDao,
    private readonly departmentDao: DepartmentDao,
    private readonly cityDao: CityDao,
  ) {}

  async findCountries(onlyActive = true): Promise<CountryResponseDto[]> {
    const countries = await this.countryDao.findCountries(onlyActive);
    return CountryMapper.toResponseDtoList(countries);
  }

  async findDepartments(countryId?: number): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentDao.findDepartments(countryId);
    return DepartmentMapper.toResponseDtoList(departments);
  }

  async findCities(departmentId?: number): Promise<CityResponseDto[]> {
    const cities = await this.cityDao.findCities(departmentId);
    return CityMapper.toResponseDtoList(cities);
  }

  async findCityById(id: number): Promise<CityResponseDto> {
    const city = await this.cityDao.findCityById(id);
    return CityMapper.toResponseDto(city);
  }

  async createCountry(dto: CreateCountryDto): Promise<CountryResponseDto> {
    const entity = CountryMapper.toEntity(dto);
    const saved = await this.countryDao.save(entity);
    return CountryMapper.toResponseDto(saved);
  }

  async createDepartment(
    dto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const entity = DepartmentMapper.toEntity(dto);
    const saved = await this.departmentDao.save(entity);
    return DepartmentMapper.toResponseDto(saved);
  }

  async createCity(dto: CreateCityDto): Promise<CityResponseDto> {
    const entity = CityMapper.toEntity(dto);
    const saved = await this.cityDao.save(entity);
    return CityMapper.toResponseDto(saved);
  }

  async updateCityStatus(
    id: number,
    isActive: boolean,
  ): Promise<CityResponseDto> {
    const city = await this.cityDao.findCityById(id);
    city.isActive = isActive;
    const updated = await this.cityDao.save(city);
    return CityMapper.toResponseDto(updated);
  }
}
