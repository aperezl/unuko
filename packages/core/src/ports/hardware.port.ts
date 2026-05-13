export type APDU = Buffer;
export type RAPDU = Buffer;

export enum TransportError {
  TIMEOUT = 'TIMEOUT',
  DISCONNECTED = 'DISCONNECTED',
  READER_ERROR = 'READER_ERROR'
}

export interface ChipStatus {
  sw1: number;
  sw2: number;
  isSuccess: boolean;
}

export interface UniversalHardwarePort {
  transmit(command: APDU): Promise<{
    success: boolean;
    data?: RAPDU;
    status?: ChipStatus;
    error?: TransportError;
  }>;
  reset(): Promise<boolean>;
}