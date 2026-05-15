import yaml from 'js-yaml';
import { Subscriber, AttachOptions } from '../../../domain/models/network.types';

export class UeransimConfigGenerator {
  static generate(subscriber: Subscriber, options?: AttachOptions): string {
    const ueConfig = {
      supi: `imsi-${subscriber.imsi}`,
      mcc: '999',
      mnc: '70',
      key: subscriber.k,
      op: subscriber.opc,
      opType: subscriber.opType || 'OPC',
      amf: subscriber.amf || '8000',
      gnbSearchList: [options?.gnbAddress || '127.0.0.1'],
      integrity: { ia1: true, ia2: true, ia3: true },
      ciphering: { ea1: true, ea2: true, ea3: true },
      integrityMaxRate: { uplink: '64kbps', downlink: '64kbps' },
      sessions: subscriber.slices.map(s => ({
        type: 'IPv4',
        apn: options?.apn || 'internet',
        slice: { sst: s.sst, sd: s.sd }
      })),
      configuredNssai: subscriber.slices.map(s => ({ sst: s.sst, sd: s.sd })),
      defaultNssai: { 
        sst: subscriber.slices.find(s => s.isDefault)?.sst || subscriber.slices[0].sst,
        sd: subscriber.slices.find(s => s.isDefault)?.sd || subscriber.slices[0].sd
      }
    };

    return yaml.dump(ueConfig);
  }
}
