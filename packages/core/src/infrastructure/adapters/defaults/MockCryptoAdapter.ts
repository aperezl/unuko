import { UniversalCryptoPort } from '../../../domain/ports/out/crypto.port';

export class MockCryptoAdapter implements UniversalCryptoPort {
  async getDeviceCertificate(): Promise<Buffer> {
    console.log('[MOCK CRYPTO] Providing dummy device certificate');
    return Buffer.from('3082010A...', 'utf-8');
  }

  async signChallenge(challenge: Buffer): Promise<Buffer> {
    console.log(`[MOCK CRYPTO] Signing challenge: ${challenge.toString('hex')}`);
    // Simular una firma (ECDSA usualmente en RSP)
    return Buffer.from('30450220' + 'A'.repeat(64) + '0221' + 'B'.repeat(64), 'hex');
  }

  async initialize(): Promise<void> {
    console.log('[MOCK CRYPTO] Initializing mock crypto module...');
  }
}
