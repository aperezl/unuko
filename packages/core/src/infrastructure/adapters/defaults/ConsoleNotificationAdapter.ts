import { NotificationPort, AlertEvent } from '../../../domain/ports/out/NotificationPort';

export class ConsoleNotificationAdapter implements NotificationPort {
  async notify(event: AlertEvent): Promise<void> {
    const timestamp = event.timestamp ? event.timestamp.toISOString() : new Date().toISOString();
    const color = this.getColor(event.severity);
    console.log(`${color}[ALERT] [${timestamp}] [${event.severity.toUpperCase()}] [${event.code}]: ${event.message}\x1b[0m`);
    if (event.payload) {
      console.log(`  Context:`, event.payload);
    }
  }

  private getColor(severity: string): string {
    switch (severity) {
      case 'critical': return '\x1b[31m'; // Red
      case 'warning': return '\x1b[33m';  // Yellow
      default: return '\x1b[36m';         // Cyan
    }
  }
}
