import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const eidRegex = /^\d{32}$/;

export const HandleDeviceChangeRequestSchema = z.object({
  iccid: z.string().min(19).max(20),
  targetEid: z.string().regex(eidRegex, "El targetEid debe tener 32 dígitos numéricos"),
  deviceChangeId: z.string().min(1, "El deviceChangeId es obligatorio")
});

export type HandleDeviceChangeRequest = z.infer<typeof HandleDeviceChangeRequestSchema>;

export const handleDeviceChangeRequest = (req: Request, res: Response) => {
  const result = HandleDeviceChangeRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de Device Change",
      details: result.error.format()
    });
  }

  const { iccid, targetEid } = result.data;
  console.log(`[SM-DP+ v2] -> [ES2+.handleDeviceChangeRequest]`);
  console.log(`              Autorizando migración de ICCID: ${iccid}`);
  console.log(`              Hacia nuevo EID:                ${targetEid}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS,
    deviceChangeAuthorized: true
  });
};