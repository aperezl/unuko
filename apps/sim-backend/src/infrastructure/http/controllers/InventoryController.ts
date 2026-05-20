import { FastifyReply, FastifyRequest } from 'fastify';
import { subscriberUseCase } from '../../../application/use-cases/SubscriberUseCase.js';

export class InventoryController {
  async getSubscribers(request: FastifyRequest, reply: FastifyReply) {
    const list = await subscriberUseCase.listSubscribers();
    return reply.send(list);
  }

  async getSubscriberByImsi(request: FastifyRequest, reply: FastifyReply) {
    const { imsi } = request.params as { imsi: string };
    try {
      const subscriber = await subscriberUseCase.getSubscriber(imsi);
      return reply.send(subscriber);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  }

  async upsertSubscriber(request: FastifyRequest, reply: FastifyReply) {
    const subscriber = request.body;
    const result = await subscriberUseCase.upsertSubscriber(subscriber);
    return reply.send(result);
  }

  async deleteSubscriber(request: FastifyRequest, reply: FastifyReply) {
    const { imsi } = request.params as { imsi: string };
    const result = await subscriberUseCase.deleteSubscriber(imsi);
    return reply.send(result);
  }
}

export const inventoryController = new InventoryController();
