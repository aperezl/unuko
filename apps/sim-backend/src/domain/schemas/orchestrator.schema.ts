import { z } from 'zod';

export const switchEnvironmentSchema = z.object({
  environment: z.enum(['mock', 'lima'], {
    message: 'Invalid environment. Must be "mock" or "lima"',
  }),
});

export const createSessionSchema = z.object({
  workflow: z.string().optional().default('provisioning'),
  workflowDefinition: z.any().optional(),
});

export const sendSessionEventSchema = z.object({
  event: z.string({
    message: 'Event name is required',
  }),
});

export const sessionIdParamSchema = z.object({
  id: z.string({
    message: 'Session ID is required',
  }),
});

export type SwitchEnvironmentRequest = z.infer<typeof switchEnvironmentSchema>;
export type CreateSessionRequest = z.infer<typeof createSessionSchema>;
export type SendSessionEventRequest = z.infer<typeof sendSessionEventSchema>;

export const switchActiveVmSchema = z.object({
  activeVm: z.string({
    message: 'Active VM name is required',
  }),
});

export const vmNameParamSchema = z.object({
  name: z.string({
    message: 'VM name parameter is required',
  }),
});

export type SwitchActiveVmRequest = z.infer<typeof switchActiveVmSchema>;

