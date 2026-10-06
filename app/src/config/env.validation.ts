// src/config/env.validation.ts

import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Local = 'local',
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  DB_HOST?: string;

  @IsNumber()
  @IsOptional()
  DB_PORT?: number = 5432;

  @IsString()
  @IsOptional()
  DB_USERNAME?: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  DB_NAME?: string;

  @IsNumber()
  @IsOptional()
  DB_POOL_SIZE: number = 10;

  @IsBoolean()
  @IsOptional()
  DB_SSL: boolean = false;

  @IsBoolean()
  @IsOptional()
  DB_LOGGING: boolean = false;

  @IsString()
  @IsOptional()
  JWT_ACCESS_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN: string = 'localhost';

  @IsBoolean()
  @IsOptional()
  COOKIE_SECURE: boolean = false;

  @IsString()
  @IsOptional()
  COOKIE_SAME_SITE: string = 'lax';

  @IsString()
  @IsOptional()
  CSRF_SECRET?: string;

  @IsNumber()
  @IsOptional()
  BCRYPT_SALT_ROUNDS: number = 10;

  @IsString()
  @IsOptional()
  CAPTCHA_SECRET?: string;

  @IsString()
  @IsOptional()
  PAYMENT_PROVIDER: string = 'mock';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Error de validación de variables de entorno: ${errors.toString()}`,
    );
  }

  // Validación de reglas de persistencia: se requiere DATABASE_URL o (DB_HOST y DB_NAME)
  if (
    !validatedConfig.DATABASE_URL &&
    (!validatedConfig.DB_HOST || !validatedConfig.DB_NAME)
  ) {
    throw new Error(
      'Configuración de base de datos incompleta: Debe proveer DATABASE_URL o al menos DB_HOST y DB_NAME.',
    );
  }

  return validatedConfig;
}
