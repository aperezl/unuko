/**
 * Utilidades para el manejo de protocolos GSMA (ASN.1/BER-TLV)
 */
export interface TLV {
    tag: string;
    value: Buffer;
    children?: TLV[];
}
/**
 * Parsea un buffer en formato BER-TLV de forma recursiva
 */
export declare function parseBERTLV(buffer: Buffer): TLV[];
