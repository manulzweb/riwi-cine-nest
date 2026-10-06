// src/modules/locations/dto/create-city.dto.ts

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCityDto {
  @IsInt()
  @IsNotEmpty({ message: 'El ID del departamento es obligatorio' })
  departmentId: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la ciudad es obligatorio' })
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
