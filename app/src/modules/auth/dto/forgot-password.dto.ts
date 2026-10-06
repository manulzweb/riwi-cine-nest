// src/modules/auth/dto/forgot-password.dto.ts

import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;
}
