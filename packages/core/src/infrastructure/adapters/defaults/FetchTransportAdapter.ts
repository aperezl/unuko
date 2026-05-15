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

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`[HTTP FETCH] Failed to ${request.url}:`, error);
      throw error;
    }
  }
}
