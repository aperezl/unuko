import { Request, Response } from 'express';
import { z } from 'zod';
import { MOCK_HEADERS, MOCK_DATA } from '../../constants';

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const AuthenticateClientRequestSchema = z.object({
  transactionId: z.string().min(1, "El transactionId es obligatorio"),
  authenticateServerResponse: z.string().regex(base64Regex, "El bloque authenticateServerResponse debe ser un Base64 válido"),
  deleteNotificationForDc: z.boolean().optional(),
});

export type AuthenticateClientRequest = z.infer<typeof AuthenticateClientRequestSchema>;

export const authenticateClient = (req: Request, res: Response) => {
  const result = AuthenticateClientRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid Request Payload - Error en serialización ASN.1/Base64 de autenticación",
      details: result.error.format()
    });
  }

  const { transactionId } = result.data;

  console.log(`[SM-DP+ v2] -> [ES9+.authenticateClient]`);
  console.log(`              Transaction ID: ${transactionId}`);
  console.log(`              Validando firma y certificados de la eUICC... OK`);

  // Respuesta HTTP JSON oficial estructurada según el Anexo I de SGP.22 v3.0
  return res.json({
    header: MOCK_HEADERS.SUCCESS,
    transactionId: transactionId,
    // profileMetadata: Datos en Base64/ASN.1 que el LPA lee para mostrar al usuario antes de instalar
    profileMetadata: MOCK_DATA.PROFILE_METADATA,
    // smdpSigned2: Contrato que el chip eUICC verificará usando la clave pública del SM-DP+
    smdpSigned2: {
      transactionId: transactionId,
      ccRequiredFlag: false,
      bppEuiccSignCert: "MIIB7zCCAXagAwIBAgIQ...MOCK_BPP_EUICC_SIGN_CERT_BASE64...",
      bppEumSignCert: "MIIB7zCCAXagAwIBAgIQ...MOCK_BPP_EUM_SIGN_CERT_BASE64..."
    },
    smdpSignature2: MOCK_DATA.SMDP_SIGNATURE_2, // Firma ECDSA generada por el SM-DP+
    smdpCertificate: MOCK_DATA.SERVER_CERTIFICATE
  });
};