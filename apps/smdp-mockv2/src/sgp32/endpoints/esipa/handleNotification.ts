import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_SGP32_HEADERS } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const IotHandleNotificationRequestSchema = z.object({
  pendingNotification: z.string().regex(base64Regex, "El bloque pendingNotification debe ser un Base64 válido"),
});

export type IotHandleNotificationRequest = z.infer<typeof IotHandleNotificationRequestSchema>;

export const handleNotificationIot = (req: Request, res: Response) => {
  const result = IotHandleNotificationRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en serialización de notificación ESipa",
      details: result.error.format()
    });
  }

  console.log(`[SM-DP+ IoT] -> [ESipa.handleNotification]`);
  console.log(`              Recibo de instalación M2M procesado y consolidado con éxito.`);

  return res.json({
    header: MOCK_SGP32_HEADERS.SUCCESS
  });
};