import { UniversalCryptoPort } from '@unuko/core';
import pkcs11js from 'pkcs11js';

export class PKCS11Adapter implements UniversalCryptoPort {
  private pkcs11: pkcs11js.PKCS11;
  private session: pkcs11js.Handle | null = null;

  constructor(
    private libraryPath: string, // p.ej. /opt/homebrew/lib/softhsm/libsofthsm2.so
    private pin: string,
    private slotIndex: number = 0
  ) {
    this.pkcs11 = new pkcs11js.PKCS11();
  }

  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log('[PKCS11]: Initializing library...');
        this.pkcs11.load(this.libraryPath);
        this.pkcs11.C_Initialize();
      } catch (e: any) {
        if (e.message?.includes('CRYPTOKI_ALREADY_INITIALIZED') || e.message?.includes('already loaded')) {
          console.log('[PKCS11]: Library already initialized, skipping C_Initialize');
        } else {
          console.warn('[PKCS11]: Initialization warning:', e.message);
        }
      }

      const slots = this.pkcs11.C_GetSlotList(true);
      const slot = slots[this.slotIndex];
      if (!slot) throw new Error(`Slot at index ${this.slotIndex} not found`);

      this.session = this.pkcs11.C_OpenSession(slot, pkcs11js.CKF_SERIAL_SESSION);
      try {
        this.pkcs11.C_Login(this.session, pkcs11js.CKU_USER, this.pin);
      } catch (e: any) {
        if (e.message?.includes('USER_ALREADY_LOGGED_IN')) {
          console.log('[PKCS11]: Already logged in');
        } else {
          throw e;
        }
      }
      console.log('[PKCS11]: Session opened and logged in');
    })();

    return this.initPromise;
  }

  async getDeviceCertificate(): Promise<Buffer> {
    // En una implementación real, buscaríamos el objeto CKO_CERTIFICATE en el token
    return Buffer.from("MOCK_GSMA_CERTIFICATE");
  }

  async signChallenge(challenge: Buffer): Promise<Buffer> {
    if (!this.session) throw new Error("Session not initialized");

    // Buscamos la clave privada (simplificado)
    const objects = this.pkcs11.C_FindObjectsInit(this.session, [{ type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PRIVATE_KEY }]);
    const hObject = this.pkcs11.C_FindObjects(this.session, 1)[0];
    this.pkcs11.C_FindObjectsFinal(this.session);

    if (!hObject) throw new Error("Private key not found in token");

    // Cambia la línea de C_SignInit por esta (quitando el null):
    this.pkcs11.C_SignInit(this.session, { mechanism: pkcs11js.CKM_ECDSA }, hObject);

    // Y en C_Sign, asegúrate de pasar un Buffer vacío para que él determine el tamaño o uno pre-alocado:
    return this.pkcs11.C_Sign(this.session, challenge, Buffer.alloc(128));

  }
}