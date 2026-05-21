import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS, MOCK_DATA } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const GetBoundProfilePackageRequestSchema = z.object({
  transactionId: z.string().min(1, "El transactionId es obligatorio"),
  prepareDownloadResponse: z.string().regex(base64Regex, "El bloque prepareDownloadResponse debe ser un Base64 válido"),
});

export type GetBoundProfilePackageRequest = z.infer<typeof GetBoundProfilePackageRequestSchema>;

export const getBoundProfilePackage = (req: Request, res: Response) => {
  const result = GetBoundProfilePackageRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en serialización ASN.1/Base64 de descarga de perfil",
      details: result.error.format()
    });
  }

  const { transactionId } = result.data;

  console.log(`[SM-DP+ v2] -> [ES9+.getBoundProfilePackage]`);
  console.log(`              Transaction ID: ${transactionId}`);
  console.log(`              Generando y empaquetando bloque cifrado BPP (Tag BF36)...`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS,
    transactionId: transactionId,
    boundProfilePackage: MOCK_DATA.BOUND_PROFILE_PACKAGE
  });
};