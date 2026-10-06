import { Cinema } from '../entities/cinema.entity.js';
import { CreateCinemaDto } from '../dto/create-cinema.dto.js';
import { UpdateCinemaDto } from '../dto/update-cinema.dto.js';
import { CinemaResponseDto } from '../dto/cinema-response.dto.js';
import { BaseMapper } from '../../../common/mappers/base-mapper.interface.js';

export class CinemaMapper implements BaseMapper<
  Cinema,
  CreateCinemaDto,
  CinemaResponseDto
> {
  static toEntity(dto: CreateCinemaDto): Cinema {
    const cinema = new Cinema();
    cinema.name = dto.name;
    cinema.address = dto.address;
    cinema.cityId = dto.cityId ?? null;
    cinema.isActive = true;
    return cinema;
  }

  static applyUpdate(entity: Cinema, dto: UpdateCinemaDto): Cinema {
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.address !== undefined) entity.address = dto.address;
    if (dto.cityId !== undefined) entity.cityId = dto.cityId;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    return entity;
  }

  static toResponseDto(entity: Cinema): CinemaResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      address: entity.address,
      cityId: entity.cityId,
      isActive: entity.isActive,
      city: entity.city
        ? { id: entity.city.id, name: entity.city.name }
        : undefined,
      rooms: entity.rooms?.map((r) => ({
        id: r.id,
        name: r.name,
        capacity: r.capacity,
        format: r.format,
      })),
    };
  }

  static toResponseDtoList(entities: Cinema[]): CinemaResponseDto[] {
    return entities.map((c) => this.toResponseDto(c));
  }

  toEntity(dto: CreateCinemaDto): Cinema {
    return CinemaMapper.toEntity(dto);
  }

  toResponseDto(entity: Cinema): CinemaResponseDto {
    return CinemaMapper.toResponseDto(entity);
  }

  toResponseDtoList(entities: Cinema[]): CinemaResponseDto[] {
    return CinemaMapper.toResponseDtoList(entities);
  }
}
