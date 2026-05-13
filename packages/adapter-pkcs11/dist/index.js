"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PKCS11Adapter = void 0;
const pkcs11js = __importStar(require("pkcs11js"));
class PKCS11Adapter {
    libraryPath;
    pin;
    slotIndex;
    pkcs11;
    session = null;
    constructor(libraryPath, // p.ej. /opt/homebrew/lib/softhsm/libsofthsm2.so
    pin, slotIndex = 0) {
        this.libraryPath = libraryPath;
        this.pin = pin;
        this.slotIndex = slotIndex;
        this.pkcs11 = new pkcs11js.PKCS11();
    }
    async initialize() {
        this.pkcs11.load(this.libraryPath);
        this.pkcs11.C_Initialize();
        const slots = this.pkcs11.C_GetSlotList(true);
        const slot = slots[this.slotIndex];
        this.session = this.pkcs11.C_OpenSession(slot, pkcs11js.CKF_SERIAL_SESSION | pkcs11js.CKF_RW_SESSION);
        this.pkcs11.C_Login(this.session, pkcs11js.CKU_USER, this.pin);
    }
    async getDeviceCertificate() {
        // En una implementación real, buscaríamos el objeto CKO_CERTIFICATE en el token
        return Buffer.from("MOCK_GSMA_CERTIFICATE");
    }
    async signChallenge(challenge) {
        if (!this.session)
            throw new Error("Session not initialized");
        // Buscamos la clave privada (simplificado)
        const objects = this.pkcs11.C_FindObjectsInit(this.session, [{ type: pkcs11js.CKA_CLASS, value: pkcs11js.CKO_PRIVATE_KEY }]);
        const hObject = this.pkcs11.C_FindObjects(this.session, 1)[0];
        this.pkcs11.C_FindObjectsFinal(this.session);
        if (!hObject)
            throw new Error("Private key not found in token");
        // Cambia la línea de C_SignInit por esta (quitando el null):
        this.pkcs11.C_SignInit(this.session, { mechanism: pkcs11js.CKM_ECDSA }, hObject);
        // Y en C_Sign, asegúrate de pasar un Buffer vacío para que él determine el tamaño o uno pre-alocado:
        return this.pkcs11.C_Sign(this.session, challenge, Buffer.alloc(128));
    }
}
exports.PKCS11Adapter = PKCS11Adapter;
