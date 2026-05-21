import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS } from '../../constants';

export const DeleteEventRequestSchema = z.object({
  eventId: z.string().min(1, "El eventId es obligatorio"),
  deletionReason: z.enum(["resolved", "expired", "cancelled"])
});

export type DeleteEventRequest = z.infer<typeof DeleteEventRequestSchema>;

export const deleteEvent = (req: Request, res: Response) => {
  const result = DeleteEventRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en validación de borrado de evento ES12",
      details: result.error.format()
    });
  }

  console.log(`[SM-DS / Discovery MOCK] -> [ES12.deleteEvent] - Evento eliminado: ${result.data.eventId} por motivo: ${result.data.deletionReason}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS
  });
};