import { UniversalCryptoPort } from '@unuko/core';
export declare class PKCS11Adapter implements UniversalCryptoPort {
    private libraryPath;
    private pin;
    private slotIndex;
    private pkcs11;
    private session;
    constructor(libraryPath: string, // p.ej. /opt/homebrew/lib/softhsm/libsofthsm2.so
    pin: string, slotIndex?: number);
    private initPromise;
    initialize(): Promise<void>;
    getDeviceCertificate(): Promise<Buffer>;
    signChallenge(challenge: Buffer): Promise<Buffer>;
}
