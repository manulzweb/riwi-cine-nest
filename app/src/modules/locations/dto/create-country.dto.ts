// src/modules/locations/dto/create-country.dto.ts

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del país es obligatorio' })
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
