import { UniversalAuditPort, AuditEntry } from '../../../domain/ports/out/audit.port';

export class CompositeAuditAdapter implements UniversalAuditPort {
  constructor(private adapters: UniversalAuditPort[]) {}

  async log(entry: Omit<AuditEntry, 'timestamp' | '_id'>): Promise<void> {
    await Promise.all(
      this.adapters.map(adapter => 
        adapter.log(entry).catch(err => {
          console.error('[CompositeAuditAdapter] Error in sub-adapter:', err);
        })
      )
    );
  }
}
