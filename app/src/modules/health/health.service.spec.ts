import { ServiceUnavailableException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityManager } from 'typeorm';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let healthService: HealthService;
  let entityManagerMock: Partial<EntityManager>;

  beforeEach(() => {
    entityManagerMock = {
      query: vi.fn(),
    };
    healthService = new HealthService(entityManagerMock as EntityManager);
  });

  describe('checkLive', () => {
    it('should return live status with uptime', () => {
      const result = healthService.checkLive();
      expect(result.status).toBe('ok');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('checkReady', () => {
    it('should return ready status when database query succeeds', async () => {
      vi.mocked(entityManagerMock.query!).mockResolvedValueOnce([
        { '?column?': 1 },
      ]);

      const result = await healthService.checkReady();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should throw ServiceUnavailableException when database query fails', async () => {
      vi.mocked(entityManagerMock.query!).mockRejectedValueOnce(
        new Error('DB connection refused'),
      );

      await expect(healthService.checkReady()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
