import yaml from 'js-yaml';

export interface UEConfig {
  supi: string;
  mcc: string;
  mnc: string;
  key: string;
  op?: string;
  opc?: string;
  opType: 'OP' | 'OPC';
  amf: string;
  imei: string;
  imeiSv: string;
  gnbSearchList: string[];
  sessions: Array<{
    type: string;
    apn: string;
    slice: { sst: number; sd?: string };
  }>;
  configuredNssai: Array<{ sst: number; sd?: string }>;
  defaultNssai: Array<{ sst: number; sd?: string }>;
  integrity?: Record<string, boolean>;
  ciphering?: Record<string, boolean>;
}

export interface GNBConfig {
  mcc: string;
  mnc: string;
  nci: string;
  idLength: number;
  tac: string;
  linkIp: string;
  ngapIp: string;
  gtpIp: string;
  amfConfigs: Array<{ address: string; port: number }>;
  slices: Array<{ sst: number; sd?: string }>;
  amfSelection: Array<{ sst: number; sd?: string }>;
}

export class UeransimConfigBuilder {
  static buildUE(config: UEConfig): string {
    // Generamos el YAML de la UE manualmente para evitar inyecciones de campos por defecto
    return [
      `supi: ${config.supi}`,
      `mcc: '${config.mcc}'`,
      `mnc: '${config.mnc}'`,
      '',
      `key: '${config.key.replace(/\s+/g, '')}'`,
      `op: '${(config.op || (config as any).opc).replace(/\s+/g, '')}'`,
      `opType: '${config.opType}'`,
      `amf: '${config.amf}'`,
      '',
      `imei: '${config.imei}'`,
      `imeiSv: '${config.imeiSv}'`,
      '',
      'gnbSearchList:',
      ...config.gnbSearchList.map(g => `  - ${g}`),
      '',
      'sessions:',
      '  - type: IPv4',
      '    apn: internet',
      '    slice:',
      '      sst: 1',
      '',
      'configured-nssai:',
      '  - sst: 1',
      '',
      'slices:',
      '  - sst: 1',
      '',
      'uacAic:',
      '  mps: false',
      '  mcs: false',
      '',
      'uacAcc:',
      '  normalClass: 0',
      '  class11: false',
      '  class12: false',
      '  class13: false',
      '  class14: false',
      '  class15: false',
      '',
      'integrity:',
      '  IA1: true',
      '  IA2: true',
      '  IA3: true',
      '',
      'ciphering:',
      '  EA1: true',
      '  EA2: true',
      '  EA3: true',
      '',
      'integrityMaxRate:',
      '  uplink: full',
      '  downlink: full'
    ].join('\n');
  }

  static buildGNB(config: GNBConfig): string {
    // Generamos el YAML de la antena manualmente para asegurar el tipado exacto
    return [
      `mcc: '${config.mcc}'`,
      `mnc: '${config.mnc}'`,
      '',
      `nci: '${config.nci}'`,
      `idLength: ${Number(config.idLength)}`,
      `tac: ${Number(config.tac)}`,
      '',
      `linkIp: ${config.linkIp}`,
      `ngapIp: ${config.ngapIp}`,
      `gtpIp: ${config.gtpIp}`,
      '',
      'amfConfigs:',
      ...config.amfConfigs.map(amf => `  - address: ${amf.address}\n    port: ${amf.port}`),
      '',
      'slices:',
      ...config.slices.map(s => `  - sst: ${Number(s.sst)}`),
      '',
      'ignoreStreamIds: true',
      'cellAccessType: nr'
    ].join('\n');
  }
}
