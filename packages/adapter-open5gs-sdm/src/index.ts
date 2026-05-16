import { Subscriber, SubscriberPort } from '@unuko/core';
import { execSync } from 'child_process';

export class Open5gsSdmAdapter implements SubscriberPort {
  constructor(private vmName: string = 'core5g') {}

  private queryMongo(evalStr: string): any {
    // Forcing JSON.stringify inside the VM to get standard JSON
    const wrappedEval = `JSON.stringify(${evalStr})`;
    const fullCommand = `limactl shell ${this.vmName} sudo mongosh open5gs --quiet --eval '${wrappedEval}'`;
    try {
      const output = execSync(fullCommand, { encoding: 'utf8' });
      if (!output || output.trim() === '') return null;
      
      // Clean up potential warnings from mongosh
      const jsonStart = output.indexOf('[');
      const jsonStartObj = output.indexOf('{');
      const start = (jsonStart !== -1 && (jsonStart < jsonStartObj || jsonStartObj === -1)) ? jsonStart : jsonStartObj;
      
      if (start === -1) return null;
      const isArray = start === jsonStart;
      const cleanJson = output.substring(start).trim();
      
      // Remove possible trailing characters if any
      const end = isArray ? cleanJson.lastIndexOf(']') + 1 : cleanJson.lastIndexOf('}') + 1;
      return JSON.parse(cleanJson.substring(0, end));
    } catch (error: any) {
      console.error(`Mongo Query failed: ${evalStr}`, error.message);
      return null;
    }
  }

  async findAll(): Promise<Subscriber[]> {
    const data = this.queryMongo('db.subscribers.find().toArray()');
    return (data || []).map((s: any) => this.toDomain(s));
  }

  async findById(imsi: string): Promise<Subscriber | undefined> {
    const data = this.queryMongo(`db.subscribers.findOne({imsi: "${imsi}"})`);
    return data ? this.toDomain(data) : undefined;
  }

  async upsert(subscriber: Subscriber): Promise<void> {
    const payload = this.toOpen5gs(subscriber);
    // Use JSON.stringify for the payload to ensure it's valid JS for the eval
    const evalStr = `db.subscribers.updateOne({imsi: "${subscriber.imsi}"}, {$set: ${JSON.stringify(payload)}}, {upsert: true})`;
    const fullCommand = `limactl shell ${this.vmName} sudo mongosh open5gs --quiet --eval '${evalStr}'`;
    try {
      execSync(fullCommand);
    } catch (error: any) {
      console.error(`Mongo Upsert failed: ${subscriber.imsi}`, error.message);
    }
  }

  async delete(imsi: string): Promise<void> {
    const evalStr = `db.subscribers.deleteOne({imsi: "${imsi}"})`;
    const fullCommand = `limactl shell ${this.vmName} sudo mongosh open5gs --quiet --eval '${evalStr}'`;
    try {
      execSync(fullCommand);
    } catch (error: any) {
      console.error(`Mongo Delete failed: ${imsi}`, error.message);
    }
  }

  private toDomain(s: any): Subscriber {
    return {
      imsi: s.imsi,
      k: (s.security?.k || '').replace(/\s+/g, ''),
      opc: (s.security?.opc || '').replace(/\s+/g, ''),
      opType: s.security?.opc ? 'OPC' : 'OP',
      amf: s.security?.amf,
      slices: s.slice?.map((sl: any) => ({
        sst: sl.sst,
        sd: sl.sd,
        isDefault: sl.default_indicator
      })) || []
    };
  }

  private toOpen5gs(s: Subscriber): any {
    return {
      imsi: s.imsi,
      security: {
        k: s.k.replace(/\s+/g, ''),
        amf: s.amf || '8000',
        op: s.opType === 'OP' ? s.opc.replace(/\s+/g, '') : null,
        opc: s.opType === 'OPC' ? s.opc.replace(/\s+/g, '') : null,
      },
      ambr: {
        downlink: { value: 1, unit: 3 },
        uplink: { value: 1, unit: 3 }
      },
      slice: s.slices.map(sl => ({
        sst: sl.sst,
        sd: sl.sd,
        default_indicator: sl.isDefault || true,
        session: [
          {
            name: 'internet',
            type: 3, // IPv4v6
            ambr: {
              downlink: { value: 1, unit: 3 },
              uplink: { value: 1, unit: 3 }
            },
            qos: {
              index: 9,
              arp: { priority_level: 8, pre_emption_capability: 1, pre_emption_vulnerability: 1 }
            }
          }
        ]
      })),
      access_restriction_data: 32,
      subscriber_status: 0,
      network_access_mode: 0,
      schema_version: 1
    };
  }
}
