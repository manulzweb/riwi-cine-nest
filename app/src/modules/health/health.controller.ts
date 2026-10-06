// src/modules/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { HealthService } from './health.service.js';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  getLive() {
    return this.healthService.checkLive();
  }

  @Get('ready')
  async getReady() {
    return this.healthService.checkReady();
  }

  @Get()
  async getHealth() {
    return this.healthService.checkReady();
  }
}
