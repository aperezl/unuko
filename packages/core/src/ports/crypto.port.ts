export interface UniversalCryptoPort {
  // Obtiene el certificado del dispositivo (firmado por GSMA)
  getDeviceCertificate(): Promise<Buffer>;

  // Firma un reto (challenge) usando la clave privada en el HSM/Chip
  // No devuelve la clave, solo la firma (ECDSA habitualmente)
  signChallenge(challenge: Buffer): Promise<Buffer>;

  // Inicializa la sesión (login al HSM si es necesario)
  initialize(): Promise<void>;
}