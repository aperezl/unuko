import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

export const CancelOrderRequestSchema = z.object({
  iccid: z.string().min(19).max(20, "El ICCID debe tener entre 19 y 20 dígitos"),
  cancelReason: z.enum(["mnoInitiated", "userCancellation", "timeout"]),
});

export type CancelOrderRequest = z.infer<typeof CancelOrderRequestSchema>;

export const cancelOrder = (req: Request, res: Response) => {
  const result = CancelOrderRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de cancelOrder ES2+",
      details: result.error.format()
    });
  }

  const { iccid, cancelReason } = result.data;
  console.log(`[SM-DP+ v2] -> [ES2+.cancelOrder]`);
  console.log(`              ICCID Cancelado: ${iccid}`);
  console.log(`              Motivo:          ${cancelReason}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};