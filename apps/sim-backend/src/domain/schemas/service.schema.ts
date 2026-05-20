import { z } from 'zod';
import { CONFIG } from '../../config/config.js';

export const serviceNameParamSchema = z.object({
  name: z.string({
    message: 'Service name is required',
  }).refine((val) => CONFIG.SERVICES.ALLOWED_SYSTEMD.includes(val), {
    message: 'Invalid systemd 5G core service name',
  }),
});

export const serviceStateActionSchema = z.object({
  action: z.enum(['start', 'stop'], {
    message: 'Invalid action. Must be "start" or "stop"',
  }),
});

export type ServiceNameParam = z.infer<typeof serviceNameParamSchema>;
export type ServiceStateActionRequest = z.infer<typeof serviceStateActionSchema>;
