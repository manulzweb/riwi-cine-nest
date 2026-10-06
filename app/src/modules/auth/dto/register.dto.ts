// src/modules/auth/dto/register.dto.ts

import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  documentType: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  documentNumber: string;

  @IsDateString(
    {},
    {
      message:
        'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)',
    },
  )
  birthDate: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono es obligatorio' })
  phone: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsBoolean({
    message: 'Debe aceptar la política de tratamiento de datos personales',
  })
  personalDataConsent: boolean;

  @IsBoolean({ message: 'Debe aceptar los términos y condiciones' })
  termsConsent: boolean;

  @IsOptional()
  @IsBoolean()
  commercialConsent?: boolean;
}
