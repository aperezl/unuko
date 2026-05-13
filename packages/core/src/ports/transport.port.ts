export interface TransportRequest {
  url: string;
  body: any;
  headers?: Record<string, string>;
}

export interface UniversalTransportPort {
  post<T>(request: TransportRequest): Promise<T>;
}