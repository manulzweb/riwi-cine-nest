// src/database/data-source.ts

import * as dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [path.join(__dirname, '../modules/**/entities/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
  subscribers: [],
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
