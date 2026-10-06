// src/database/seeders/run-seeders.ts

import 'reflect-metadata';
import AppDataSource from '../data-source.js';
import { seedCatalog } from './catalog.seeder.js';

async function run() {
  try {
    console.log('🚀 Initializing Data Source for Seeders...');
    await AppDataSource.initialize();
    console.log('✅ Data Source Initialized');

    await seedCatalog(AppDataSource);

    console.log('🎉 All seeders executed successfully!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing seeders:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

void run();
