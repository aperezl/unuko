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
    const doc = {
      supi: config.supi,
      mcc: String(config.mcc),
      mnc: String(config.mnc),
      protectionScheme: 0,
      homeNetworkPublicKey: '5a8d38864820197c3394b92613b20b91633cbd897119273bf8e4a6f4eec0a650',
      homeNetworkPublicKeyId: 1,
      routingIndicator: '0000',
      key: config.key.replace(/\s+/g, ''),
      op: (config.op || (config as any).opc).replace(/\s+/g, ''),
      opType: config.opType,
      amf: config.amf,
      imei: config.imei,
      imeiSv: config.imeiSv,
      tunNetmask: '255.255.255.0',
      gnbSearchList: config.gnbSearchList,
      uacAic: { mps: false, mcs: false },
      uacAcc: {
        normalClass: 0,
        class11: false,
        class12: false,
        class13: false,
        class14: false,
        class15: false
      },
      sessions: config.sessions,
      'configured-nssai': config.configuredNssai,
      'default-nssai': config.defaultNssai,
      slices: config.configuredNssai, // Añadimos esta sección que falta
      integrity: config.integrity || { IA1: true, IA2: true, IA3: true },
      ciphering: config.ciphering || { EA1: true, EA2: true, EA3: true },
      integrityMaxRate: { uplink: 'full', downlink: 'full' }
    };
    return yaml.dump(doc);
  }

  static buildGNB(config: GNBConfig): string {
    const doc = {
      mcc: String(config.mcc),
      mnc: String(config.mnc),
      nci: String(config.nci),
      idLength: config.idLength,
      tac: config.tac,
      linkIp: config.linkIp,
      ngapIp: config.ngapIp,
      gtpIp: config.gtpIp,
      amfConfigs: config.amfConfigs,
      slices: config.slices,
      amfSelection: config.slices.map(s => ({ sst: s.sst })), // Vinculación explícita
      ignoreStreamIds: true,
      cellAccessType: 'nr'
    };
    return yaml.dump(doc);
  }
}
