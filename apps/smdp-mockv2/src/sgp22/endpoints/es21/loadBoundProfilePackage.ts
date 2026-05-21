import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const LoadBoundProfilePackageRequestSchema = z.object({
  transactionId: z.string().min(1),
  boundProfilePackage: z.string().regex(base64Regex, "El boundProfilePackage debe ser Base64"),
});

export type LoadBoundProfilePackageRequest = z.infer<typeof LoadBoundProfilePackageRequestSchema>;

export const loadBoundProfilePackage = (req: Request, res: Response) => {
  const result = LoadBoundProfilePackageRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en interfaz corporativa ES21",
      details: result.error.format()
    });
  }

  console.log(`[SM-DP+ v2] -> [ES21.loadBoundProfilePackage]`);
  console.log(`              Carga delegada completada con éxito para la transacción corporativa.`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};