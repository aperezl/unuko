/**
 * Utilidades para el manejo de protocolos GSMA (ASN.1/BER-TLV)
 */
/**
 * Parsea un buffer en formato BER-TLV de forma recursiva
 */
export function parseBERTLV(buffer) {
    const tlvs = [];
    let offset = 0;
    while (offset < buffer.length) {
        // 1. Leer Tag
        const tagByte = buffer[offset];
        let tagStr = tagByte.toString(16).toUpperCase();
        offset++;
        // Soporte para tags multi-byte (ej: 9F 70 o BF 37)
        if ((tagByte & 0x1F) === 0x1F) {
            tagStr += buffer[offset].toString(16).toUpperCase().padStart(2, '0');
            offset++;
        }
        // 2. Leer Longitud (BER-TLV simple)
        if (offset >= buffer.length)
            break;
        let length = buffer[offset];
        offset++;
        if (length > 0x80) {
            const lenBytes = length & 0x7F;
            length = 0;
            for (let i = 0; i < lenBytes; i++) {
                length = (length << 8) | buffer[offset];
                offset++;
            }
        }
        if (offset + length > buffer.length) {
            // Caso de buffer mal formado o truncado
            length = buffer.length - offset;
        }
        const value = buffer.subarray(offset, offset + length);
        offset += length;
        // 3. ¿Es un tag construido (bit 6 set)?
        let children;
        if ((tagByte & 0x20) === 0x20) {
            children = parseBERTLV(value);
        }
        tlvs.push({ tag: tagStr, value, children });
    }
    return tlvs;
}
