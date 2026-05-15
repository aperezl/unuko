import { UniversalNetworkPort } from '../../../domain/ports/out/network.port';
import { Subscriber, UESession, NetworkMetrics, AttachOptions } from '../../../domain/models/network.types';

export class MockNetworkAdapter implements UniversalNetworkPort {
  private subscribers: Map<string, Subscriber> = new Map();
  private sessions: Map<string, UESession> = new Map();
  private delayMs: number;

  constructor(options?: { delayMs?: number }) {
    this.delayMs = options?.delayMs ?? 0;
  }

  async provision(subscriber: Subscriber): Promise<void> {
    console.log(`[MOCK NETWORK] Provisioning subscriber: ${subscriber.imsi}`);
    this.subscribers.set(subscriber.imsi, subscriber);
  }

  async deprovision(imsi: string): Promise<void> {
    console.log(`[MOCK NETWORK] Deprovisioning subscriber: ${imsi}`);
    this.subscribers.delete(imsi);
  }

  async attachUE(imsi: string, options?: AttachOptions): Promise<UESession> {
    console.log(`[MOCK NETWORK] Attaching UE: ${imsi} to APN: ${options?.apn || 'internet'}`);
    
    if (!this.subscribers.has(imsi)) {
      throw new Error(`Subscriber ${imsi} not found in core database`);
    }

    const session: UESession = {
      sessionId: `mock-session-${Date.now()}`,
      imsi,
      status: 'ATTACHING'
    };
    this.sessions.set(imsi, session);

    // Simular el tiempo de conexión configurable
    if (this.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
    }

    session.status = 'CONNECTED';
    session.ipAddress = `10.45.0.${Math.floor(Math.random() * 254) + 2}`;
    session.interfaceName = 'uesimtun0';

    return { ...session };
  }

  async detachUE(imsi: string): Promise<void> {
    console.log(`[MOCK NETWORK] Detaching UE: ${imsi}`);
    this.sessions.delete(imsi);
  }

  async getMetrics(imsi: string): Promise<NetworkMetrics> {
    return {
      sessionId: this.sessions.get(imsi)?.sessionId || 'none',
      timestamp: Date.now(),
      uplinkBytes: Math.floor(Math.random() * 10000),
      downlinkBytes: Math.floor(Math.random() * 50000),
      latencyMs: Math.floor(Math.random() * 20) + 10,
      rrcState: 'RRC_CONNECTED'
    };
  }

  async getSessions(): Promise<UESession[]> {
    return Array.from(this.sessions.values());
  }
}
