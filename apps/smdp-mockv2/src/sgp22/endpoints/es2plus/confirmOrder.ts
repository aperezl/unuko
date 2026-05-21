import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const eidRegex = /^\d{32}$/;

export const ConfirmOrderRequestSchema = z.object({
  iccid: z.string().min(19).max(20, "El ICCID debe tener entre 19 y 20 dígitos"),
  eid: z.string().regex(eidRegex, "El EID debe tener exactamente 32 dígitos numéricos"),
  matchingId: z.string().optional(),
});

export type ConfirmOrderRequest = z.infer<typeof ConfirmOrderRequestSchema>;

export const confirmOrder = (req: Request, res: Response) => {
  const result = ConfirmOrderRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de confirmación ES2+",
      details: result.error.format()
    });
  }

  const { iccid, matchingId } = result.data;

  const resolvedMatchingId = matchingId || `MATCHING-${iccid}-UNUKO-2026`;

  console.log(`[SM-DP+ v2] -> [ES2+.confirmOrder]`);
  console.log(`              Orden confirmada para el ICCID: ${iccid}`);
  console.log(`              Activation Code (MatchingID):   ${resolvedMatchingId}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS,
    matchingId: resolvedMatchingId
  });
};