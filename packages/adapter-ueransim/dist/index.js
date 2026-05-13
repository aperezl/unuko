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
exports.UeransimAdapter = void 0;
const core_1 = require("@unuko/core");
const net = __importStar(require("net"));
class UeransimAdapter {
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
                resolve({ success: false, error: core_1.TransportError.READER_ERROR });
            });
            client.on('timeout', () => {
                client.destroy();
                resolve({ success: false, error: core_1.TransportError.TIMEOUT });
            });
        });
    }
}
exports.UeransimAdapter = UeransimAdapter;
