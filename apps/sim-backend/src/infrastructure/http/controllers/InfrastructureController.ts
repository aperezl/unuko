import { FastifyReply, FastifyRequest } from 'fastify';
import { deviceUseCase } from '../../../application/use-cases/DeviceUseCase.js';

export class InfrastructureController {
  async getDevices(request: FastifyRequest, reply: FastifyReply) {
    const devices = await deviceUseCase.getDevices();
    return reply.send(devices);
  }

  async clearAllDevices(request: FastifyRequest, reply: FastifyReply) {
    const result = await deviceUseCase.clearAllDevices();
    return reply.send(result);
  }

  async provisionAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await deviceUseCase.provisionAll();
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async attachUE(request: FastifyRequest, reply: FastifyReply) {
    const { imsi, gnbAddress } = request.body as { imsi: string; gnbAddress?: string };
    try {
      const result = await deviceUseCase.attachUE(imsi, gnbAddress);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async updateUE(request: FastifyRequest, reply: FastifyReply) {
    const { imsi } = request.params as { imsi: string };
    const config = request.body;
    try {
      const result = await deviceUseCase.updateUE(imsi, config);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async startGNB(request: FastifyRequest, reply: FastifyReply) {
    const config = request.body;
    try {
      const result = await deviceUseCase.startGNB(config);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async updateGNB(request: FastifyRequest, reply: FastifyReply) {
    const { nci } = request.params as { nci: string };
    const config = request.body;
    try {
      const result = await deviceUseCase.updateGNB(nci, config);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async stopDevice(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const result = await deviceUseCase.stopDevice(id);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async removeDevice(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const result = await deviceUseCase.removeDevice(id);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async startDevice(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const result = await deviceUseCase.startDevice(id);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async getDeviceLogs(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const result = await deviceUseCase.getDeviceLogs(id);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async getDeviceYaml(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const result = await deviceUseCase.getDeviceYaml(id);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }

  async saveDeviceYaml(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { yaml } = request.body as { yaml: string };
    try {
      const result = await deviceUseCase.saveDeviceYaml(id, yaml);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  }
}

export const infrastructureController = new InfrastructureController();
