// test/verify-database-connectivity.ts

import AppDataSource from '../src/database/data-source';
import { ALL_ENTITIES } from '../src/database/entities';

async function main() {
  console.log('--- Iniciando Verificación de Conectividad y Mapeo TypeORM ---');
  console.log(`Conectando a base de datos en puerto ${process.env.DB_PORT || 5432}...`);

  await AppDataSource.initialize();
  console.log('✅ Conexión con PostgreSQL establecida exitosamente.\n');

  let successCount = 0;
  let failureCount = 0;
  const failures: { entityName: string; error: string }[] = [];

  for (const entity of ALL_ENTITIES) {
    const entityName = entity.name;
    try {
      const repo = AppDataSource.getRepository(entity);
      const tableName = repo.metadata.tableName;
      const count = await repo.count();
      const sample = await repo.find({ take: 1 });

      console.log(
        `✅ [${entityName.padEnd(26)}] -> tabla "${tableName.padEnd(28)}" | Filas: ${count} | Hidratación OK`,
      );
      successCount++;
    } catch (err: any) {
      console.error(
        `❌ [${entityName.padEnd(26)}] ERROR: ${err.message}`,
      );
      failures.push({ entityName, error: err.message });
      failureCount++;
    }
  }

  console.log('\n--- Resumen de Verificación ---');
  console.log(`Total entidades testeadas: ${ALL_ENTITIES.length}`);
  console.log(`Exitosas: ${successCount}`);
  console.log(`Fallidas: ${failureCount}`);

  await AppDataSource.destroy();

  if (failureCount > 0) {
    console.error('\nErrores detectados en entidades:');
    console.error(failures);
    process.exit(1);
  } else {
    console.log('\n🎉 ¡TODAS LAS 30 ENTIDADES MAPEARON E HIDRATARON AL 100% SIN ERRORES!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fallo fatal en el script de verificación:', err);
  process.exit(1);
});
