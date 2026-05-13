import { TransportError } from '@unuko/core';
import * as net from 'net';
export class UeransimAdapter {
    host;
    port;
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }
    async reset() {
        // Simulación de Power-on/Reset para la UE de UERANSIM
        return true;
    }
    async transmit(command) {
        return new Promise((resolve) => {
            const client = new net.Socket();
            let responseData = Buffer.alloc(0);
            client.setTimeout(5000);
            client.connect(this.port, this.host, () => {
                // UERANSIM espera el APDU crudo en su interfaz de control de eUICC
                client.write(command);
            });
            client.on('data', (chunk) => {
                const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                responseData = Buffer.concat([responseData, bufferChunk]);
                // Si recibimos al menos 2 bytes, tenemos el Status Word (SW)
                if (responseData.length >= 2) {
                    const sw1 = responseData[responseData.length - 2];
                    const sw2 = responseData[responseData.length - 1];
                    client.destroy();
                    resolve({
                        success: true,
                        data: responseData.subarray(0, responseData.length - 2),
                        status: { sw1, sw2, isSuccess: sw1 === 0x90 && sw2 === 0x00 }
                    });
                }
            });
            client.on('error', () => {
                resolve({ success: false, error: TransportError.READER_ERROR });
            });
            client.on('timeout', () => {
                client.destroy();
                resolve({ success: false, error: TransportError.TIMEOUT });
            });
        });
    }
}
