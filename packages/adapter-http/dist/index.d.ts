import { UniversalTransportPort, TransportRequest, UniversalCryptoPort } from '@unuko/core';
export declare class HttpmTLSAdapter implements UniversalTransportPort {
    private crypto;
    constructor(crypto: UniversalCryptoPort);
    post<T>(request: TransportRequest): Promise<T>;
}
