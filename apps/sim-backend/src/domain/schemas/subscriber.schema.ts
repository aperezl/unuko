import { z } from 'zod';

export const upsertSubscriberSchema = z.object({
  imsi: z.string({
    message: 'IMSI is required',
  }).regex(/^\d{15}$/, 'IMSI must be exactly 15 digits'),
}).passthrough();

export const imsiParamSchema = z.object({
  imsi: z.string({
    message: 'IMSI parameter is required',
  }),
});

export type UpsertSubscriberRequest = z.infer<typeof upsertSubscriberSchema>;
export type ImsiParam = z.infer<typeof imsiParamSchema>;
