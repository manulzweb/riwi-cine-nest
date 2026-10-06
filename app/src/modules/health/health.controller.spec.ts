import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

describe('HealthController', () => {
  let controller: HealthController;
  let serviceMock: Partial<HealthService>;

  beforeEach(() => {
    serviceMock = {
      checkLive: vi.fn().mockReturnValue({
        status: 'ok',
        uptime: 10,
        timestamp: '2026-10-06T12:00:00.000Z',
      }),
      checkReady: vi.fn().mockResolvedValue({
        status: 'ok',
        database: 'connected',
        timestamp: '2026-10-06T12:00:00.000Z',
      }),
    };
    controller = new HealthController(serviceMock as HealthService);
  });

  it('should call checkLive on getLive', () => {
    const res = controller.getLive();
    expect(serviceMock.checkLive).toHaveBeenCalled();
    expect(res.status).toBe('ok');
  });

  it('should call checkReady on getReady', async () => {
    const res = await controller.getReady();
    expect(serviceMock.checkReady).toHaveBeenCalled();
    expect(res.database).toBe('connected');
  });

  it('should call checkReady on getHealth', async () => {
    const res = await controller.getHealth();
    expect(serviceMock.checkReady).toHaveBeenCalled();
    expect(res.status).toBe('ok');
  });
});
