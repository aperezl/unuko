import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const ConfirmDeviceChangeRequestSchema = z.object({
  transactionId: z.string().min(1, "El transactionId es obligatorio"),
  deviceChangeResponse: z.string().regex(base64Regex, "El bloque deviceChangeResponse debe ser un Base64 válido"),
});

export type ConfirmDeviceChangeRequest = z.infer<typeof ConfirmDeviceChangeRequestSchema>;

export const confirmDeviceChange = (req: Request, res: Response) => {
  const result = ConfirmDeviceChangeRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de confirmDeviceChange ES9+",
      details: result.error.format()
    });
  }

  console.log(`[SM-DP+ v2] -> [ES9+.confirmDeviceChange]`);
  console.log(`              Transaction ID: ${result.data.transactionId}`);
  console.log(`              Recibo de migración de dispositivo verificado con éxito.`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};