import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_SGP32_HEADERS, MOCK_SGP32_DATA } from '../../constants';

const eidRegex = /^\d{32}$/;

export const EimTriggerDownloadRequestSchema = z.object({
  eid: z.string().regex(eidRegex, "El EID en entornos IoT debe tener exactamente 32 dígitos numéricos"),
  eimId: z.string().min(1, "El eimId es obligatorio"),
  iccid: z.string().min(19).max(20).optional(),
  autoActivationRequired: z.boolean().default(true),
});

export type EimTriggerDownloadRequest = z.infer<typeof EimTriggerDownloadRequestSchema>;

export const eimTriggerDownload = (req: Request, res: Response) => {
  const result = EimTriggerDownloadRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de trigger ESeim",
      details: result.error.format()
    });
  }

  const { eid, eimId, iccid } = result.data;
  const targetIccid = iccid || "89049032000009999999";

  console.log(`[SM-DP+ IoT] -> [ESeim.eimTriggerDownload]`);
  console.log(`              Disparador recibido del eIM:  ${eimId}`);
  console.log(`              Target Device EID:            ${eid}`);
  console.log(`              Perfil enlazado ICCID:         ${targetIccid}`);

  return res.json({
    header: MOCK_SGP32_HEADERS.SUCCESS,
    transactionId: MOCK_SGP32_DATA.TRANSACTION_ID,
    iccid: targetIccid
  });
};