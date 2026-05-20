import { UniversalTransportPort, TransportRequest } from '../../../domain/ports/out/transport.port';
import { UniversalAuditPort } from '../../../domain/ports/out/audit.port';

export class TransportAuditOutboundAdapter implements UniversalTransportPort {
  constructor(
    private decorated: UniversalTransportPort,
    private audit: UniversalAuditPort,
    private sessionId: string
  ) {}

  async post<T>(request: TransportRequest): Promise<T> {
    await this.audit.log({
      sessionId: this.sessionId,
      category: 'TRANSPORT',
      level: 'INFO',
      direction: 'OUT',
      payload: {
        url: request.url,
        headers: request.headers,
        body: request.body
      },
      description: `HTTP POST Request to ${new URL(request.url).pathname}`
    });

    try {
      const response = await this.decorated.post<T>(request);
      
      await this.audit.log({
        sessionId: this.sessionId,
        category: 'TRANSPORT',
        level: 'INFO',
        direction: 'IN',
        payload: response,
        description: `HTTP Response from ${new URL(request.url).pathname}`
      });

      return response;
    } catch (error) {
      const payload: any = { error: error instanceof Error ? error.message : String(error) };
      if (error && typeof error === 'object') {
        if ('status' in error) {
          payload._httpStatus = (error as any).status;
        }
        if ('rawBody' in error) {
          payload._rawBody = (error as any).rawBody;
        }
      }
      await this.audit.log({
        sessionId: this.sessionId,
        category: 'TRANSPORT',
        level: 'ERROR',
        direction: 'IN',
        payload,
        description: `HTTP Failure from ${new URL(request.url).pathname}`
      });
      throw error;
    }
  }
}
