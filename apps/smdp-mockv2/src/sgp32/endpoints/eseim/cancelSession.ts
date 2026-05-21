import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_SGP32_HEADERS } from '../../constants';

export const IotEimCancelSessionRequestSchema = z.object({
  transactionId: z.string().min(1, "El transactionId es obligatorio"),
  eimId: z.string().min(1, "El eimId es obligatorio"),
  cancelReason: z.enum(["eimTimeout", "policyViolation", "deviceDecommissioned", "mnoInitiated"]),
});

export type IotEimCancelSessionRequest = z.infer<typeof IotEimCancelSessionRequestSchema>;

export const cancelSessionEim = (req: Request, res: Response) => {
  const result = IotEimCancelSessionRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en cancelación desde interfaz ESeim",
      details: result.error.format()
    });
  }

  const { transactionId, eimId, cancelReason } = result.data;

  console.log(`[SM-DP+ IoT] -> [ESeim.cancelSession]`);
  console.log(`              Cancelación forzada por el eIM: ${eimId}`);
  console.log(`              Transaction ID afectado:       ${transactionId}`);
  console.log(`              Motivo técnico de revocación:  ${cancelReason}`);

  return res.json({
    header: MOCK_SGP32_HEADERS.SUCCESS
  });
};