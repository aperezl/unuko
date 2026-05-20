import { UniversalTransportPort, TransportRequest } from '../../../domain/ports/out/transport.port';

export class FetchTransportAdapter implements UniversalTransportPort {
  async post<T>(request: TransportRequest): Promise<T> {
    console.log(`[HTTP FETCH] POST ${request.url}`);
    
    try {
      const response = await fetch(request.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: JSON.stringify(request.body)
      });

      const rawBody = await response.text();

      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`) as any;
        error.status = response.status;
        error.rawBody = rawBody;
        throw error;
      }

      let json: any;
      try {
        json = JSON.parse(rawBody);
      } catch (e) {
        json = { data: rawBody };
      }

      if (json && typeof json === 'object') {
        json._httpStatus = response.status;
        json._rawBody = rawBody;
      }

      return json as T;
    } catch (error) {
      console.error(`[HTTP FETCH] Failed to ${request.url}:`, error);
      throw error;
    }
  }
}
