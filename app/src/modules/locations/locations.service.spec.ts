// src/modules/locations/locations.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service.js';
import { CountryDao } from './dao/country.dao.js';
import { DepartmentDao } from './dao/department.dao.js';
import { CityDao } from './dao/city.dao.js';

describe('LocationsService', () => {
  let service: LocationsService;

  const mockCountryDao = {
    findCountries: jest.fn(),
    save: jest.fn(),
  };

  const mockDepartmentDao = {
    findDepartments: jest.fn(),
    save: jest.fn(),
  };

  const mockCityDao = {
    findCities: jest.fn(),
    findCityById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: CountryDao,
          useValue: mockCountryDao,
        },
        {
          provide: DepartmentDao,
          useValue: mockDepartmentDao,
        },
        {
          provide: CityDao,
          useValue: mockCityDao,
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
      mockCountryDao.findCountries.mockResolvedValue([
        { id: 1, name: 'Colombia', isActive: true },
      ]);
      const result = await service.findCountries();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Colombia');
    });
  });

  describe('findDepartments', () => {
    it('should return departments filtered by countryId', async () => {
      mockDepartmentDao.findDepartments.mockResolvedValue([
        { id: 1, name: 'Antioquia', countryId: 1, isActive: true },
      ]);
      const result = await service.findDepartments(1);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Antioquia');
    });
  });

  describe('findCities', () => {
    it('should return cities filtered by departmentId', async () => {
      mockCityDao.findCities.mockResolvedValue([
        { id: 1, name: 'Medellín', departmentId: 1, isActive: true },
      ]);
      const result = await service.findCities(1);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Medellín');
    });
  });

  describe('findCityById', () => {
    it('should return city if found', async () => {
      mockCityDao.findCityById.mockResolvedValue({
        id: 1,
        name: 'Medellín',
        isActive: true,
      });
      const result = await service.findCityById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if city does not exist', async () => {
      mockCityDao.findCityById.mockRejectedValue(new NotFoundException());
      await expect(service.findCityById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createCity', () => {
    it('should create and return city', async () => {
      mockCityDao.save.mockResolvedValue({
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
      expect(result.name).toBe('Envigado');
    });
  });
});
