import { UniversalTransportPort, TransportRequest } from '../ports/transport.port';
import { UniversalAuditPort } from '../ports/audit.port';

export class TransportAuditDecorator implements UniversalTransportPort {
  constructor(
    private decorated: UniversalTransportPort,
    private audit: UniversalAuditPort,
    private sessionId: string
  ) {}

  async post<T>(request: TransportRequest): Promise<T> {
    await this.audit.log({
      sessionId: this.sessionId,
      category: 'TRANSPORT',
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
        direction: 'IN',
        payload: response,
        description: `HTTP Response from ${new URL(request.url).pathname}`
      });

      return response;
    } catch (error) {
      await this.audit.log({
        sessionId: this.sessionId,
        category: 'TRANSPORT',
        direction: 'IN',
        payload: { error: error instanceof Error ? error.message : String(error) },
        description: `HTTP Failure from ${new URL(request.url).pathname}`
      });
      throw error;
    }
  }
}
