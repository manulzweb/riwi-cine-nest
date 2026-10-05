// src/modules/locations/locations.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Country } from './entities/country.entity';
import { Department } from './entities/department.entity';
import { City } from './entities/city.entity';

describe('LocationsService', () => {
  let service: LocationsService;

  const mockCountryRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDepartmentRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCityRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountryRepo,
        },
        {
          provide: getRepositoryToken(Department),
          useValue: mockDepartmentRepo,
        },
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepo,
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findCountries', () => {
    it('should return active countries', async () => {
      mockCountryRepo.find.mockResolvedValue([{ id: 1, name: 'Colombia' }]);
      const result = await service.findCountries();
      expect(result).toHaveLength(1);
    });
  });

  describe('findDepartments', () => {
    it('should return departments filtered by countryId', async () => {
      mockDepartmentRepo.find.mockResolvedValue([
        { id: 1, name: 'Antioquia', countryId: 1 },
      ]);
      const result = await service.findDepartments(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findCities', () => {
    it('should return cities filtered by departmentId', async () => {
      mockCityRepo.find.mockResolvedValue([
        { id: 1, name: 'Medellín', departmentId: 1 },
      ]);
      const result = await service.findCities(1);
      expect(result).toHaveLength(1);
    });
  });

  describe('findCityById', () => {
    it('should return city if found', async () => {
      mockCityRepo.findOne.mockResolvedValue({ id: 1, name: 'Medellín' });
      const result = await service.findCityById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if city does not exist', async () => {
      mockCityRepo.findOne.mockResolvedValue(null);
      await expect(service.findCityById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createCity', () => {
    it('should create and return city', async () => {
      mockDepartmentRepo.findOne.mockResolvedValue({
        id: 1,
        name: 'Antioquia',
      });
      mockCityRepo.create.mockReturnValue({
        id: 1,
        name: 'Envigado',
        departmentId: 1,
        isActive: true,
      });
      mockCityRepo.save.mockResolvedValue({
        id: 1,
        name: 'Envigado',
        departmentId: 1,
        isActive: true,
      });

      const result = await service.createCity({
        name: 'Envigado',
        departmentId: 1,
      });
      expect(result.id).toBe(1);
    });
  });
});
