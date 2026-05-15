export interface Subscriber {
  imsi: string;
  k: string;
  opc: string;
  amf?: string;
  opType?: 'OPC' | 'OP';
  slices: Slice[];
}

export interface Slice {
  sst: number;
  sd?: string; // 6-digit hex string
  isDefault?: boolean;
}

export interface UESession {
  sessionId: string;
  imsi: string;
  status: 'IDLE' | 'ATTACHING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  ipAddress?: string;
  interfaceName?: string;
  error?: string;
}

export interface NetworkMetrics {
  sessionId: string;
  timestamp: number;
  uplinkBytes: number;
  downlinkBytes: number;
  latencyMs?: number;
  rrcState?: string;
}

export interface AttachOptions {
  apn?: string;
  gnbAddress?: string;
  timeout?: number;
}
