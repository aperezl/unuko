import { UniversalHardwarePort, APDU, TransportError, ChipStatus } from '@unuko/core';
export declare class UeransimAdapter implements UniversalHardwarePort {
    private host;
    private port;
    constructor(host: string, port: number);
    reset(): Promise<boolean>;
    transmit(command: APDU): Promise<{
        success: boolean;
        data?: Buffer;
        status?: ChipStatus;
        error?: TransportError;
    }>;
}
