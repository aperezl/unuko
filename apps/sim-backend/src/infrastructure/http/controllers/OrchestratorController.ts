import { FastifyReply, FastifyRequest } from 'fastify';
import { sessionUseCase } from '../../../application/use-cases/SessionUseCase.js';
import { environmentUseCase } from '../../../application/use-cases/EnvironmentUseCase.js';
import { serviceUseCase } from '../../../application/use-cases/ServiceUseCase.js';

export class OrchestratorController {
  async getSessions(request: FastifyRequest, reply: FastifyReply) {
    const sessions = await sessionUseCase.listSessions();
    return reply.send(sessions);
  }

  async createSession(request: FastifyRequest, reply: FastifyReply) {
    const { workflow, workflowDefinition } = (request.body as { workflow?: string; workflowDefinition?: any }) || {};
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionId = `SESSION-${randomSuffix}`;

    await sessionUseCase.startSession(sessionId, workflow, undefined, workflowDefinition);

    return reply.send({
      status: 'created',
      sessionId,
      workflow: workflowDefinition ? 'dynamic' : workflow || 'provisioning',
      url: `/v1/orchestrator/session/${sessionId}`
    });
  }

  async deleteSession(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await sessionUseCase.deleteSession(id);
    return reply.send(result);
  }

  async getSessionDetails(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const details = await sessionUseCase.getSessionDetails(id);
    if (!details) {
      return reply.status(404).send({ error: 'Session not found' });
    }
    return reply.send(details);
  }

  async sendSessionEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { event } = request.body as { event: string };
    try {
      const result = await sessionUseCase.sendSessionEvent(id, event);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  }

  async getEnvironment(request: FastifyRequest, reply: FastifyReply) {
    const env = environmentUseCase.getEnvironment();
    return reply.send(env);
  }

  async setEnvironment(request: FastifyRequest, reply: FastifyReply) {
    const { environment } = request.body as { environment: 'mock' | 'lima' };
    const env = environmentUseCase.setEnvironment(environment);
    return reply.send(env);
  }

  async getServicesStatus(request: FastifyRequest, reply: FastifyReply) {
    const status = await serviceUseCase.getServicesStatus();
    return reply.send(status);
  }

  async toggleServiceState(request: FastifyRequest, reply: FastifyReply) {
    const { name } = request.params as { name: string };
    const { action } = request.body as { action: 'start' | 'stop' };
    const result = await serviceUseCase.toggleServiceState(name, action);
    return reply.send(result);
  }
}

export const orchestratorController = new OrchestratorController();
