import { Device } from '../domain/device.types';

export interface DeviceRepository {
  getDevices(): Promise<Device[]>;
  clearAllDevices(): Promise<any>;
  provisionAll(): Promise<any>;
  attachUE(imsi: string, gnbAddress?: string): Promise<any>;
  updateUE(imsi: string, config: any): Promise<any>;
  startGNB(config: any): Promise<any>;
  updateGNB(nci: string, config: any): Promise<any>;
  stopDevice(id: string): Promise<any>;
  removeDevice(id: string): Promise<any>;
  startDevice(id: string): Promise<any>;
  getDeviceLogs(id: string): Promise<string>;
  getDeviceYaml(id: string): Promise<string>;
  saveDeviceYaml(id: string, yaml: string): Promise<any>;
}
