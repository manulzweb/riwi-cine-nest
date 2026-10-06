import { Department } from '../entities/department.entity.js';
import { CreateDepartmentDto } from '../dto/create-department.dto.js';
import { DepartmentResponseDto } from '../dto/department-response.dto.js';
import { BaseMapper } from '../../../common/mappers/base-mapper.interface.js';

export class DepartmentMapper implements BaseMapper<
  Department,
  CreateDepartmentDto,
  DepartmentResponseDto
> {
  static toEntity(dto: CreateDepartmentDto): Department {
    const dept = new Department();
    dept.countryId = dto.countryId;
    dept.name = dto.name;
    dept.isActive = dto.isActive ?? true;
    return dept;
  }

  static toResponseDto(entity: Department): DepartmentResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      countryId: entity.countryId,
      isActive: entity.isActive,
      countryName: entity.country?.name,
      cities: entity.cities?.map((c) => ({
        id: c.id,
        name: c.name,
      })),
    };
  }

  static toResponseDtoList(entities: Department[]): DepartmentResponseDto[] {
    return entities.map((d) => this.toResponseDto(d));
  }

  toEntity(dto: CreateDepartmentDto): Department {
    return DepartmentMapper.toEntity(dto);
  }

  toResponseDto(entity: Department): DepartmentResponseDto {
    return DepartmentMapper.toResponseDto(entity);
  }

  toResponseDtoList(entities: Department[]): DepartmentResponseDto[] {
    return DepartmentMapper.toResponseDtoList(entities);
  }
}
