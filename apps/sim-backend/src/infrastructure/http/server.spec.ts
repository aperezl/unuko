import { vi, describe, it, expect, beforeEach } from 'vitest';
import fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

// Mock all use cases to isolate http layer
vi.mock('../../application/use-cases/DeviceUseCase.js', () => ({
  deviceUseCase: {
    getDevices: vi.fn().mockResolvedValue([{ id: 'gnb-1', type: 'GNB' }]),
    clearAllDevices: vi.fn().mockResolvedValue({ status: 'cleared' }),
    provisionAll: vi.fn().mockResolvedValue({
      status: 'success',
      message: 'seeded',
      details: { subscribersSeeded: 1, gnbsStarted: 1, uesStarted: 1 }
    }),
    attachUE: vi.fn().mockResolvedValue({ status: 'created', session: {} }),
    updateUE: vi.fn().mockResolvedValue({ status: 'updated', id: '123' }),
    startGNB: vi.fn().mockResolvedValue({ status: 'created', device: {} }),
    updateGNB: vi.fn().mockResolvedValue({ status: 'updated', id: '123' }),
    stopDevice: vi.fn().mockResolvedValue({ status: 'stopped', id: '123' }),
    removeDevice: vi.fn().mockResolvedValue({ status: 'removed', id: '123' }),
    startDevice: vi.fn().mockResolvedValue({ status: 'started', id: '123' }),
    getDeviceLogs: vi.fn().mockResolvedValue({ logs: ['log1'] }),
    getDeviceYaml: vi.fn().mockResolvedValue({ yaml: 'mcc: 999' }),
    saveDeviceYaml: vi.fn().mockResolvedValue({ status: 'saved' }),
  }
}));

vi.mock('../../application/use-cases/SubscriberUseCase.js', () => ({
  subscriberUseCase: {
    listSubscribers: vi.fn().mockResolvedValue([{ imsi: '123456789012345' }]),
    getSubscriber: vi.fn().mockResolvedValue({ imsi: '123456789012345' }),
    upsertSubscriber: vi.fn().mockResolvedValue({ status: 'success' }),
    deleteSubscriber: vi.fn().mockResolvedValue({ status: 'deleted' }),
  }
}));

vi.mock('../../application/use-cases/SessionUseCase.js', () => ({
  sessionUseCase: {
    listSessions: vi.fn().mockResolvedValue([{ sessionId: 'S1', status: 'idle' }]),
    startSession: vi.fn().mockResolvedValue({}),
    deleteSession: vi.fn().mockResolvedValue({ status: 'deleted', sessionId: 'S1' }),
    getSessionDetails: vi.fn().mockResolvedValue({ sessionId: 'S1', status: 'idle', logs: [] }),
    sendSessionEvent: vi.fn().mockResolvedValue({ status: 'event_processed', event: 'NEXT' }),
  }
}));

vi.mock('../../application/use-cases/EnvironmentUseCase.js', () => ({
  environmentUseCase: {
    getEnvironment: vi.fn().mockReturnValue({ environment: 'mock' }),
    setEnvironment: vi.fn().mockReturnValue({ environment: 'lima' }),
  }
}));

vi.mock('../../application/use-cases/ServiceUseCase.js', () => ({
  serviceUseCase: {
    getServicesStatus: vi.fn().mockResolvedValue([{ name: 'AMF', status: 'online', type: 'systemd', host: '127.0.0.1', port: 38412, description: 'AMF service' }]),
    toggleServiceState: vi.fn().mockResolvedValue({ status: 'active' }),
  }
}));

import { orchestratorRoutes } from './routes/orchestrator.routes';
import { inventoryRoutes } from './routes/inventory.routes';
import { infrastructureRoutes } from './routes/infrastructure.routes';
import { deviceUseCase } from '../../application/use-cases/DeviceUseCase.js';
import { subscriberUseCase } from '../../application/use-cases/SubscriberUseCase.js';
import { sessionUseCase } from '../../application/use-cases/SessionUseCase.js';
import { environmentUseCase } from '../../application/use-cases/EnvironmentUseCase.js';
import { serviceUseCase } from '../../application/use-cases/ServiceUseCase.js';

describe('HTTP routes and controllers', () => {
  let app: ReturnType<typeof fastify>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = fastify();
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    await app.register(orchestratorRoutes);
    await app.register(inventoryRoutes);
    await app.register(infrastructureRoutes);
  });

  describe('Orchestrator Routes', () => {
    it('GET /v1/orchestrator/environment', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/orchestrator/environment'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ environment: 'mock' });
    });

    it('POST /v1/orchestrator/environment', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/orchestrator/environment',
        body: { environment: 'lima' }
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ environment: 'lima' });
      expect(environmentUseCase.setEnvironment).toHaveBeenCalledWith('lima');
    });

    it('GET /v1/orchestrator/sessions', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/orchestrator/sessions'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([{ sessionId: 'S1', status: 'idle' }]);
    });

    it('POST /v1/orchestrator/session', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/orchestrator/session',
        body: { workflow: 'provisioning' }
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().status).toBe('created');
      expect(res.json().sessionId).toBeDefined();
    });

    it('GET /v1/orchestrator/session/:id', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/orchestrator/session/S1'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ sessionId: 'S1', status: 'idle', logs: [] });
    });

    it('GET /v1/orchestrator/session/:id - 404 not found', async () => {
      vi.mocked(sessionUseCase.getSessionDetails).mockResolvedValueOnce(null);
      const res = await app.inject({
        method: 'GET',
        url: '/v1/orchestrator/session/non-existent'
      });
      expect(res.statusCode).toBe(404);
    });

    it('POST /v1/orchestrator/session/:id/event', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/orchestrator/session/S1/event',
        body: { event: 'NEXT' }
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ status: 'event_processed', event: 'NEXT' });
    });

    it('DELETE /v1/orchestrator/session/:id', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/v1/orchestrator/session/S1'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ status: 'deleted', sessionId: 'S1' });
    });

    it('GET /v1/orchestrator/services/status', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/orchestrator/services/status'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()[0].name).toBe('AMF');
    });

    it('POST /v1/orchestrator/services/:name/state', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/orchestrator/services/open5gs-amfd/state',
        body: { action: 'start' }
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ status: 'active' });
    });
  });

  describe('Inventory Routes', () => {
    it('GET /v1/inventory/subscribers', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/inventory/subscribers'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([{ imsi: '123456789012345' }]);
    });

    it('GET /v1/inventory/subscribers/:imsi', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/inventory/subscribers/123456789012345'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ imsi: '123456789012345' });
    });

    it('POST /v1/inventory/subscribers', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/inventory/subscribers',
        body: { imsi: '123456789012345' }
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ status: 'success' });
    });

    it('DELETE /v1/inventory/subscribers/:imsi', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/v1/inventory/subscribers/123456789012345'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ status: 'deleted' });
    });
  });

  describe('Infrastructure Routes', () => {
    it('GET /v1/infrastructure/devices', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/infrastructure/devices'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([{ id: 'gnb-1', type: 'GNB' }]);
    });

    it('POST /v1/infrastructure/provision-all', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/infrastructure/provision-all'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().status).toBe('success');
    });

    it('POST /v1/infrastructure/ue', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/infrastructure/ue',
        body: { imsi: '123456789012345', gnbAddress: '127.0.0.1' }
      });
      expect(res.statusCode).toBe(200);
    });

    it('PUT /v1/infrastructure/ue/:imsi', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/v1/infrastructure/ue/123456789012345',
        body: { mcc: '999', mnc: '70' }
      });
      expect(res.statusCode).toBe(200);
    });

    it('POST /v1/infrastructure/gnb', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/infrastructure/gnb',
        body: { nci: '0x10' }
      });
      expect(res.statusCode).toBe(200);
    });

    it('PUT /v1/infrastructure/gnb/:nci', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/v1/infrastructure/gnb/0x10',
        body: { mcc: '999', mnc: '70' }
      });
      expect(res.statusCode).toBe(200);
    });

    it('POST /v1/infrastructure/device/:id/stop', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/infrastructure/device/gnb-1/stop'
      });
      expect(res.statusCode).toBe(200);
    });

    it('DELETE /v1/infrastructure/device/:id', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/v1/infrastructure/device/gnb-1'
      });
      expect(res.statusCode).toBe(200);
    });

    it('POST /v1/infrastructure/device/:id/start', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/infrastructure/device/gnb-1/start'
      });
      expect(res.statusCode).toBe(200);
    });

    it('GET /v1/infrastructure/device/:id/logs', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/infrastructure/device/gnb-1/logs'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ logs: ['log1'] });
    });

    it('GET /v1/infrastructure/device/:id/config', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/v1/infrastructure/device/gnb-1/config'
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ yaml: 'mcc: 999' });
    });

    it('PUT /v1/infrastructure/device/:id/config', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/v1/infrastructure/device/gnb-1/config',
        body: { yaml: 'mcc: 888' }
      });
      expect(res.statusCode).toBe(200);
    });
  });
});
