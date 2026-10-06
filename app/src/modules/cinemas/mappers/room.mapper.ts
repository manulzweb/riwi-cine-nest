import { Room } from '../entities/room.entity.js';
import { CreateRoomDto } from '../dto/create-room.dto.js';
import { RoomResponseDto } from '../dto/room-response.dto.js';
import { BaseMapper } from '../../../common/mappers/base-mapper.interface.js';

export class RoomMapper implements BaseMapper<
  Room,
  CreateRoomDto,
  RoomResponseDto
> {
  static toEntity(dto: CreateRoomDto, cinemaId?: number): Room {
    const room = new Room();
    if (cinemaId !== undefined) room.cinemaId = cinemaId;
    room.name = dto.name;
    room.format = dto.format || '2D';
    room.capacity = dto.capacity ?? 0;
    room.isActive = true;
    return room;
  }

  static toResponseDto(entity: Room): RoomResponseDto {
    return {
      id: entity.id,
      cinemaId: entity.cinemaId,
      name: entity.name,
      format: entity.format,
      capacity: entity.capacity,
      isActive: entity.isActive,
    };
  }

  static toResponseDtoList(entities: Room[]): RoomResponseDto[] {
    return entities.map((r) => this.toResponseDto(r));
  }

  toEntity(dto: CreateRoomDto): Room {
    return RoomMapper.toEntity(dto);
  }

  toResponseDto(entity: Room): RoomResponseDto {
    return RoomMapper.toResponseDto(entity);
  }

  toResponseDtoList(entities: Room[]): RoomResponseDto[] {
    return RoomMapper.toResponseDtoList(entities);
  }
}
