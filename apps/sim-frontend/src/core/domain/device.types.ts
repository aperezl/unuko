export interface Device {
  id: string;
  type: 'UE' | 'GNB';
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  connected: boolean;
  ip?: string;
  mcc?: string;
  mnc?: string;
  config?: any;
}
