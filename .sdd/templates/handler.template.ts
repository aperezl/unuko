import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const RequestBodySchema = z.object({
  name: z.string().min(1)
});

export async function registerRoutes(fastify: FastifyInstance) {
  fastify.post('/api/resource', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RequestBodySchema.parse(request.body);
      
      // Lógica de negocio (Llamar a caso de uso)
      
      return reply.code(200).send({
        status: 'success',
        data: body
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({
          status: 'error',
          message: 'Validation failed',
          details: err.errors
        });
      }
      return reply.code(500).send({
        status: 'error',
        message: err.message || 'Internal server error'
      });
    }
  });
}
