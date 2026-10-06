import { City } from '../entities/city.entity.js';
import { CreateCityDto } from '../dto/create-city.dto.js';
import { CityResponseDto } from '../dto/city-response.dto.js';
import { BaseMapper } from '../../../common/mappers/base-mapper.interface.js';

export class CityMapper implements BaseMapper<
  City,
  CreateCityDto,
  CityResponseDto
> {
  static toEntity(dto: CreateCityDto): City {
    const city = new City();
    city.departmentId = dto.departmentId;
    city.name = dto.name;
    city.isActive = dto.isActive ?? true;
    return city;
  }

  static toResponseDto(entity: City): CityResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      departmentId: entity.departmentId,
      isActive: entity.isActive,
      departmentName: entity.department?.name,
      countryName: entity.department?.country?.name,
      cinemas: entity.cinemas?.map((c) => ({
        id: c.id,
        name: c.name,
      })),
    };
  }

  static toResponseDtoList(entities: City[]): CityResponseDto[] {
    return entities.map((c) => this.toResponseDto(c));
  }

  toEntity(dto: CreateCityDto): City {
    return CityMapper.toEntity(dto);
  }

  toResponseDto(entity: City): CityResponseDto {
    return CityMapper.toResponseDto(entity);
  }

  toResponseDtoList(entities: City[]): CityResponseDto[] {
    return CityMapper.toResponseDtoList(entities);
  }
}
