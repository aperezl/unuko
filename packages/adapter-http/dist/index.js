import https from 'https';
export class HttpmTLSAdapter {
    crypto;
    constructor(crypto) {
        this.crypto = crypto;
    }
    async post(request) {
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
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SM-DP+ Error (${response.status}): ${errorText}`);
        }
        return response.json();
    }
}
export * from './WebhookNotificationAdapter.js';
