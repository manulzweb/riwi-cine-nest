// test/verify-database-connectivity.ts

import { Test } from '@nestjs/testing';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AppModule } from '../src/app.module.js';

async function main() {
  console.log('--- Iniciando Verificación NestJS TypeOrmModule ---');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const entityManager = app.get<EntityManager>(getEntityManagerToken());
  console.log(
    '✅ Conexión con PostgreSQL establecida a través de TypeOrmModule.',
  );
  await entityManager.query('SELECT 1');
  console.log('✅ Verificación completada con éxito.');

  await app.close();
}

main().catch((err) => {
  console.error('Error en script de verificación:', err);
  process.exit(1);
});
