import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

export const ReleaseProfileRequestSchema = z.object({
  iccid: z.string().min(19).max(20, "El ICCID debe tener entre 19 y 20 dígitos"),
});

export type ReleaseProfileRequest = z.infer<typeof ReleaseProfileRequestSchema>;

export const releaseProfile = (req: Request, res: Response) => {
  const result = ReleaseProfileRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de releaseProfile ES2+",
      details: result.error.format()
    });
  }

  console.log(`[SM-DP+ v2] -> [ES2+.releaseProfile] - ICCID Liberado: ${result.data.iccid}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};