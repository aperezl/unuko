export interface ServiceStatus {
  name: string;
  serviceName?: string;
  type: string;
  port: number | null;
  host: string;
  forwardedPort?: number;
  status: string;
  description: string;
}
