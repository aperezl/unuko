import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

export const CancelSessionMnoRequestSchema = z.object({
  transactionId: z.string().min(1, "El transactionId es obligatorio"),
  iccid: z.string().min(19).max(20),
  reason: z.string().min(1, "La razón de la cancelación por operador es obligatoria")
});

export type CancelSessionMnoRequest = z.infer<typeof CancelSessionMnoRequestSchema>;

export const cancelSessionMno = (req: Request, res: Response) => {
  const result = CancelSessionMnoRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en cancelSession del operador",
      details: result.error.format()
    });
  }

  console.log(`[SM-DP+ v2] -> [ES2+.cancelSession (MNO)]`);
  console.log(`              Cancelando Tx ${result.data.transactionId} para ICCID ${result.data.iccid}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};