import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS, MOCK_DATA } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const InitiateAuthenticationRequestSchema = z.object({
  euiccChallenge: z.string().regex(base64Regex, "El euiccChallenge debe ser un Base64 válido"),
  smdpAddress: z.string().min(1, "El smdpAddress es obligatorio"),
  euiccInfo1: z.string().regex(base64Regex, "El bloque euiccInfo1 debe ser un Base64 válido").optional(),
  lpaRspCapability: z.string().regex(base64Regex, "El bloque lpaRspCapability debe ser un Base64 válido").optional(),
});

export type InitiateAuthenticationRequest = z.infer<typeof InitiateAuthenticationRequestSchema>;

export const initiateAuthentication = (req: Request, res: Response) => {
  const result = InitiateAuthenticationRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en serialización ASN.1/Base64 del protocolo",
      details: result.error.format()
    });
  }

  const { euiccChallenge, smdpAddress } = result.data;

  console.log(`[SM-DP+ v2] -> [ES9+.initiateAuthentication]`);
  console.log(`              eUICC Challenge (Base64): ${euiccChallenge}`);
  console.log(`              SM-DP+ Address Solicitado: ${smdpAddress}`);

  return res.json({
    header: MOCK_HEADERS.SUCCESS,
    transactionId: MOCK_DATA.TRANSACTION_ID,
    serverSigned1: {
      transactionId: MOCK_DATA.TRANSACTION_ID,
      smdpAddress: smdpAddress,
      euiccChallenge: euiccChallenge
    },
    serverSignature1: MOCK_DATA.SERVER_SIGNATURE_1,
    euiccCiPKIdToBeUsed: MOCK_DATA.CI_PK_ID,
    serverCertificate: MOCK_DATA.SERVER_CERTIFICATE
  });
};