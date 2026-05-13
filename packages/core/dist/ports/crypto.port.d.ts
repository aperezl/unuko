export interface UniversalCryptoPort {
    getDeviceCertificate(): Promise<Buffer>;
    signChallenge(challenge: Buffer): Promise<Buffer>;
    initialize(): Promise<void>;
}
//# sourceMappingURL=crypto.port.d.ts.map