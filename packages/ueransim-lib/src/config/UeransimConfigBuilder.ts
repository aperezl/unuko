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
    const lines = [
      `supi: ${config.supi}`,
      `mcc: '${config.mcc}'`,
      `mnc: '${config.mnc}'`,
      '',
      `key: '${config.key.replace(/\s+/g, '')}'`,
      `op: '${(config.op || (config as any).opc || '').replace(/\s+/g, '')}'`,
      `opType: '${config.opType || 'OPC'}'`,
      `amf: '${config.amf || '8000'}'`,
      '',
      `imei: '${config.imei || '356938035643803'}'`,
      `imeiSv: '${config.imeiSv || '4370816125816151'}'`,
      '',
      'gnbSearchList:',
      ...(config.gnbSearchList || ['127.0.0.1']).map(g => `  - ${g}`),
      '',
      'sessions:',
    ];

    if (config.sessions && config.sessions.length > 0) {
      config.sessions.forEach(s => {
        lines.push('  - type: IPv4');
        lines.push(`    apn: ${s.apn || 'internet'}`);
        lines.push('    slice:');
        lines.push(`      sst: ${s.slice.sst}`);
        if (s.slice.sd) {
          const sdHex = s.slice.sd.startsWith('0x') ? s.slice.sd : `0x${s.slice.sd}`;
          lines.push(`      sd: ${sdHex}`);
        }
      });
    } else {
      lines.push('  - type: IPv4');
      lines.push('    apn: internet');
      lines.push('    slice:');
      lines.push('      sst: 1');
    }

    lines.push('', 'configured-nssai:');
    if (config.configuredNssai && config.configuredNssai.length > 0) {
      config.configuredNssai.forEach(n => {
        lines.push(`  - sst: ${n.sst}`);
        if (n.sd) {
          const sdHex = n.sd.startsWith('0x') ? n.sd : `0x${n.sd}`;
          lines.push(`    sd: ${sdHex}`);
        }
      });
    } else {
      lines.push('  - sst: 1');
    }

    lines.push('', 'slices:');
    if (config.configuredNssai && config.configuredNssai.length > 0) {
      config.configuredNssai.forEach(n => {
        lines.push(`  - sst: ${n.sst}`);
        if (n.sd) {
          const sdHex = n.sd.startsWith('0x') ? n.sd : `0x${n.sd}`;
          lines.push(`    sd: ${sdHex}`);
        }
      });
    } else {
      lines.push('  - sst: 1');
    }

    lines.push(
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
    );

    return lines.join('\n');
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
      ...config.slices.map(s => {
        let str = `  - sst: ${Number(s.sst)}`;
        if (s.sd) {
          const sdHex = s.sd.startsWith('0x') ? s.sd : `0x${s.sd}`;
          str += `\n    sd: ${sdHex}`;
        }
        return str;
      }),
      '',
      'ignoreStreamIds: true',
      'cellAccessType: nr'
    ].join('\n');
  }
}
