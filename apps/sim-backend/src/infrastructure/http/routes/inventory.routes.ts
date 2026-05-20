import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { inventoryController } from '../controllers/InventoryController.js';
import {
  upsertSubscriberSchema,
  imsiParamSchema
} from '../../../domain/schemas/subscriber.schema.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get('/v1/inventory/subscribers', {
    schema: {
      description: 'List all subscribers in the active network database (Open5GS Mongo or Mock)',
      tags: ['Subscriber Inventory'],
      response: {
        200: z.array(z.any()),
      },
    },
  }, inventoryController.getSubscribers);

  server.get('/v1/inventory/subscribers/:imsi', {
    schema: {
      description: 'Get subscriber details by IMSI',
      tags: ['Subscriber Inventory'],
      params: imsiParamSchema,
      response: {
        200: z.any(),
      },
    },
  }, inventoryController.getSubscriberByImsi);

  server.post('/v1/inventory/subscribers', {
    schema: {
      description: 'Upsert/save subscriber credentials and profile settings',
      tags: ['Subscriber Inventory'],
      body: upsertSubscriberSchema,
      response: {
        200: z.object({ status: z.string() }),
      },
    },
  }, inventoryController.upsertSubscriber);

  server.delete('/v1/inventory/subscribers/:imsi', {
    schema: {
      description: 'Delete subscriber profile',
      tags: ['Subscriber Inventory'],
      params: imsiParamSchema,
      response: {
        200: z.object({ status: z.string() }),
      },
    },
  }, inventoryController.deleteSubscriber);
}
