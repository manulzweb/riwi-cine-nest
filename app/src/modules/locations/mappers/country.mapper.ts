import { Country } from '../entities/country.entity.js';
import { CreateCountryDto } from '../dto/create-country.dto.js';
import { CountryResponseDto } from '../dto/country-response.dto.js';
import { BaseMapper } from '../../../common/mappers/base-mapper.interface.js';

export class CountryMapper implements BaseMapper<
  Country,
  CreateCountryDto,
  CountryResponseDto
> {
  static toEntity(dto: CreateCountryDto): Country {
    const country = new Country();
    country.name = dto.name;
    country.isActive = dto.isActive ?? true;
    return country;
  }

  static toResponseDto(entity: Country): CountryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      isActive: entity.isActive,
      departments: entity.departments?.map((d) => ({
        id: d.id,
        name: d.name,
      })),
    };
  }

  static toResponseDtoList(entities: Country[]): CountryResponseDto[] {
    return entities.map((c) => this.toResponseDto(c));
  }

  toEntity(dto: CreateCountryDto): Country {
    return CountryMapper.toEntity(dto);
  }

  toResponseDto(entity: Country): CountryResponseDto {
    return CountryMapper.toResponseDto(entity);
  }

  toResponseDtoList(entities: Country[]): CountryResponseDto[] {
    return CountryMapper.toResponseDtoList(entities);
  }
}
