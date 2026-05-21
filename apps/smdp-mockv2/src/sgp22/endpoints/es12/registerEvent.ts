import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

const eidRegex = /^\d{32}$/;

export const RegisterEventRequestSchema = z.object({
  eid: z.string().regex(eidRegex, "El EID debe tener exactamente 32 dígitos numéricos"),
  rvmExecutionStatus: z.number().optional(),
  smdpAddress: z.string().min(1, "La dirección del SM-DP+ origen es obligatoria")
});

export type RegisterEventRequest = z.infer<typeof RegisterEventRequestSchema>;

export const registerEvent = (req: Request, res: Response) => {
  const result = RegisterEventRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de registro de evento ES12",
      details: result.error.format()
    });
  }

  const { eid, smdpAddress } = result.data;
  console.log(`[SM-DS / Discovery MOCK] -> [ES12.registerEvent]`);
  console.log(`                          Registrando evento de eSIM listo para EID: ${eid}`);
  console.log(`                          Redirección hacia SM-DP+: ${smdpAddress}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS,
    eventId: `event-ds-${Math.floor(Math.random() * 1000000)}`
  });
};