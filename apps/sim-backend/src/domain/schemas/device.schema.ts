import { z } from 'zod';

export const attachUeSchema = z.object({
  imsi: z.string({
    message: 'IMSI is required',
  }),
  gnbAddress: z.string().optional(),
});

export const startGnbSchema = z.object({
  mcc: z.string().optional().default('999'),
  mnc: z.string().optional().default('70'),
  nci: z.string().optional().default('0x000000010'),
  idLength: z.number().optional().default(32),
  tac: z.string().optional().default('1'),
  linkIp: z.string().optional().default('127.0.0.1'),
  ngapIp: z.string().optional().default('127.0.0.1'),
  gtpIp: z.string().optional().default('127.0.0.1'),
  amfAddress: z.string().optional().default('127.0.0.5'),
});

export const updateUeSchema = z.object({
  mcc: z.string().optional().default('999'),
  mnc: z.string().optional().default('70'),
  gnbAddress: z.string().optional().default('127.0.0.1'),
});

export const deviceIdParamSchema = z.object({
  id: z.string({
    message: 'Device ID is required',
  }),
});

export const nciParamSchema = z.object({
  nci: z.string({
    message: 'NCI is required',
  }),
});

export const saveDeviceYamlSchema = z.object({
  yaml: z.string({
    message: 'YAML configuration content is required',
  }),
});

export type AttachUeRequest = z.infer<typeof attachUeSchema>;
export type StartGnbRequest = z.infer<typeof startGnbSchema>;
export type UpdateUeRequest = z.infer<typeof updateUeSchema>;
export type DeviceIdParam = z.infer<typeof deviceIdParamSchema>;
export type NciParam = z.infer<typeof nciParamSchema>;
export type SaveDeviceYamlRequest = z.infer<typeof saveDeviceYamlSchema>;
