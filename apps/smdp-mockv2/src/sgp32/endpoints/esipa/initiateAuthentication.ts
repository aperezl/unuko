import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_SGP32_HEADERS, MOCK_SGP32_DATA } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const IotInitiateAuthenticationRequestSchema = z.object({
  euiccChallenge: z.string().regex(base64Regex, "El euiccChallenge debe ser un Base64 válido"),
  smdpAddress: z.string().min(1, "La dirección smdpAddress es obligatoria"),
  euiccInfo1: z.string().regex(base64Regex, "El bloque euiccInfo1 debe ser un Base64 válido"),
  cryptoCapability: z.string().regex(base64Regex, "El bloque cryptoCapability debe ser un Base64 válido"),
});

export type IotInitiateAuthenticationRequest = z.infer<typeof IotInitiateAuthenticationRequestSchema>;

export const initiateAuthenticationIot = (req: Request, res: Response) => {
  const result = IotInitiateAuthenticationRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en handshake criptográfico SGP.32",
      details: result.error.format()
    });
  }

  const { euiccChallenge, smdpAddress } = result.data;

  console.log(`[SM-DP+ IoT] -> [ESipa.initiateAuthentication]`);
  console.log(`              eUICC Challenge M2M: ${euiccChallenge}`);
  console.log(`              SM-DP+ IoT Address:  ${smdpAddress}`);

  return res.json({
    header: MOCK_SGP32_HEADERS.SUCCESS,
    transactionId: MOCK_SGP32_DATA.TRANSACTION_ID,
    serverSigned1: {
      transactionId: MOCK_SGP32_DATA.TRANSACTION_ID,
      smdpAddress: smdpAddress,
      euiccChallenge: euiccChallenge
    },
    serverSignature1: MOCK_SGP32_DATA.SERVER_SIGNATURE_1,
    euiccCiPKIdToBeUsed: "GSMA_IOT_ROOT_CA_PK_01",
    serverCertificate: MOCK_SGP32_DATA.SERVER_CERTIFICATE
  });
};