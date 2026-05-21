import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const eidRegex = /^\d{32}$/;

export const DownloadOrderRequestSchema = z.object({
  eid: z.string().regex(eidRegex, "El EID debe tener exactamente 32 dígitos numéricos"),
  iccid: z.string().min(19).max(20).optional(),
  profileType: z.string().optional(),
});

export type DownloadOrderRequest = z.infer<typeof DownloadOrderRequestSchema>;

export const downloadOrder = (req: Request, res: Response) => {
  const result = DownloadOrderRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de parámetros de operador ES2+",
      details: result.error.format()
    });
  }

  const { eid, iccid } = result.data;
  const resolvedIccid = iccid || "89049032000001234567"; // ICCID mock por defecto si el operador no fija uno

  console.log(`[SM-DP+ v2] -> [ES2+.downloadOrder]`);
  console.log(`              EID del dispositivo: ${eid}`);
  console.log(`              Asignando ICCID:     ${resolvedIccid}`);

  // Respuesta oficial contemplada en el estándar v3.0 para la orden de descarga
  return res.json({
    header: MOCK_HEADERS.SUCCESS,
    iccid: resolvedIccid
  });
};