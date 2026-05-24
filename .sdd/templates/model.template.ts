import { z } from 'zod';

// Esquema de validación Zod para la entidad
export const EntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type Entity = z.infer<typeof EntitySchema>;

export class EntityDomainModel {
  static create(data: unknown): Entity {
    return EntitySchema.parse(data);
  }
}
