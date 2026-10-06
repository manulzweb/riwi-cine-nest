// src/modules/locations/dto/create-department.dto.ts

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del país es obligatorio' })
  countryId: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del departamento es obligatorio' })
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
