// src/database/migrations/1700000000001-AddTimestampDefaults.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampDefaults1700000000001 implements MigrationInterface {
  name = 'AddTimestampDefaults1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (
              SELECT table_name, column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND column_name IN ('created_at', 'updated_at', 'createdAt', 'updatedAt')
                AND column_default IS NULL
          ) LOOP
              EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT now()', r.table_name, r.column_name);
          END LOOP;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (
              SELECT table_name, column_name 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND column_name IN ('created_at', 'updated_at', 'createdAt', 'updatedAt')
          ) LOOP
              EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP DEFAULT', r.table_name, r.column_name);
          END LOOP;
      END $$;
    `);
  }
}
