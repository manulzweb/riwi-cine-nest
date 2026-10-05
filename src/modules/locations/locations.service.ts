// src/modules/locations/locations.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateCityDto } from './dto/create-city.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { City } from './entities/city.entity';
import { Country } from './entities/country.entity';
import { Department } from './entities/department.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async findCountries(onlyActive = true): Promise<Country[]> {
    const where = onlyActive ? { isActive: true } : {};
    return this.countryRepo.find({
      where,
      relations: ['departments'],
      order: { name: 'ASC' },
    });
  }

  async findDepartments(countryId?: number): Promise<Department[]> {
    const where: FindOptionsWhere<Department> = { isActive: true };
    if (countryId) where.countryId = countryId;
    return this.departmentRepo.find({
      where,
      relations: ['country', 'cities'],
      order: { name: 'ASC' },
    });
  }

  async findCities(departmentId?: number): Promise<City[]> {
    const where: FindOptionsWhere<City> = { isActive: true };
    if (departmentId) where.departmentId = departmentId;
    return this.cityRepo.find({
      where,
      relations: ['department'],
      order: { name: 'ASC' },
    });
  }

  async findCityById(id: number): Promise<City> {
    const city = await this.cityRepo.findOne({
      where: { id },
      relations: ['department', 'department.country', 'cinemas'],
    });
    if (!city) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Ciudad no encontrada',
      });
    }
    return city;
  }

  async createCountry(dto: CreateCountryDto): Promise<Country> {
    const country = this.countryRepo.create({
      name: dto.name,
      isActive: dto.isActive ?? true,
    });
    return this.countryRepo.save(country);
  }

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepo.create({
      countryId: dto.countryId,
      name: dto.name,
      isActive: dto.isActive ?? true,
    });
    return this.departmentRepo.save(department);
  }

  async createCity(dto: CreateCityDto): Promise<City> {
    const city = this.cityRepo.create({
      departmentId: dto.departmentId,
      name: dto.name,
      isActive: dto.isActive ?? true,
    });
    return this.cityRepo.save(city);
  }

  async updateCityStatus(id: number, isActive: boolean): Promise<City> {
    const city = await this.findCityById(id);
    city.isActive = isActive;
    return this.cityRepo.save(city);
  }
}
