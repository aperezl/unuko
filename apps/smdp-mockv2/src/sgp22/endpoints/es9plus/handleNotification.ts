import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const HandleNotificationRequestSchema = z.object({
  pendingNotification: z.string().regex(base64Regex, "El bloque pendingNotification debe ser un Base64 válido"),
});

export type HandleNotificationRequest = z.infer<typeof HandleNotificationRequestSchema>;

export const handleNotification = (req: Request, res: Response) => {
  const result = HandleNotificationRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en serialización ASN.1/Base64 de notificación",
      details: result.error.format()
    });
  }

  console.log(`[SM-DP+ v2] -> [ES9+.handleNotification]`);
  console.log(`              Recibo de notificación eUICC recibido y almacenado con éxito.`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};