import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const eidRegex = /^\d{32}$/;

export const ProvideEIDRequestSchema = z.object({
  iccid: z.string().min(19).max(20),
  eid: z.string().regex(eidRegex, "El EID debe tener exactamente 32 dígitos numéricos"),
  requiredProfileOwner: z.string().optional()
});

export type ProvideEIDRequest = z.infer<typeof ProvideEIDRequestSchema>;

export const provideEID = (req: Request, res: Response) => {
  const result = ProvideEIDRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de provideEID ES2+",
      details: result.error.format()
    });
  }

  console.log(`[SM-DP+ v2] -> [ES2+.provideEID]`);
  console.log(`              Asociando ICCID ${result.data.iccid} al EID fijo: ${result.data.eid}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};