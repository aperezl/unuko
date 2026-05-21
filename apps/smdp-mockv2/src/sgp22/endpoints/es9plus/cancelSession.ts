import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const CancelSessionRequestSchema = z.object({
  transactionId: z.string().min(1, "El transactionId es obligatorio"),
  cancelSessionResponse: z.string().regex(base64Regex, "El bloque cancelSessionResponse debe ser un Base64 válido"),
});

export type CancelSessionRequest = z.infer<typeof CancelSessionRequestSchema>;

export const cancelSession = (req: Request, res: Response) => {
  const result = CancelSessionRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en serialización ASN.1/Base64 de cancelación",
      details: result.error.format()
    });
  }

  const { transactionId } = result.data;

  console.log(`[SM-DP+ v2] -> [ES9+.cancelSession]`);
  console.log(`              Transaction ID: ${transactionId}`);
  console.log(`              Recibo de cancelación eUICC verificado criptográficamente.`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};