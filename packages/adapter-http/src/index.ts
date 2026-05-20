import {
  UniversalTransportPort,
  TransportRequest,
  UniversalCryptoPort
} from '@unuko/core';
import https from 'https';

export class HttpmTLSAdapter implements UniversalTransportPort {
  constructor(private crypto: UniversalCryptoPort) { }

  async post<T>(request: TransportRequest): Promise<T> {
    // Obtenemos el certificado que el orquestador gestiona vía PKCS#11/HSM
    const cert = await this.crypto.getDeviceCertificate();

    // Configuración mTLS 1.3
    const agent = new https.Agent({
      cert: cert,
      // Nota: En entornos de producción con PKCS#11, la clave privada no se pasa aquí,
      // se delega al engine de OpenSSL. Para esta PoC, asumimos mTLS estándar.
      minVersion: 'TLSv1.3',
      maxVersion: 'TLSv1.3',
      rejectUnauthorized: true
    });

    const response = await fetch(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'unuko-orchestrator/1.0',
        ...request.headers
      },
      body: JSON.stringify(request.body),
      // @ts-ignore - Node.js fetch soporta Dispatcher/Agent
      agent
    });

    const rawBody = await response.text();

    if (!response.ok) {
      const error = new Error(`SM-DP+ Error (${response.status}): ${rawBody}`) as any;
      error.status = response.status;
      error.rawBody = rawBody;
      throw error;
    }

    let json: any;
    try {
      json = JSON.parse(rawBody);
    } catch (e) {
      json = { data: rawBody };
    }

    if (json && typeof json === 'object') {
      json._httpStatus = response.status;
      json._rawBody = rawBody;
    }

    return json as T;
  }
}

export * from './WebhookNotificationAdapter';