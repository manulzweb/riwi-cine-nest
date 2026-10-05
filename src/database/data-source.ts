// src/database/data-source.ts

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ALL_ENTITIES } from './entities';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ALL_ENTITIES,
  migrations: ['src/database/migrations/*{.ts,.js}'],
  subscribers: [],
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
