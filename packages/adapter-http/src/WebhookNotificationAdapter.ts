import { NotificationPort, AlertEvent } from '@unuko/core';

export class WebhookNotificationAdapter implements NotificationPort {
  constructor(private webhookUrl: string) { }

  async notify(event: AlertEvent): Promise<void> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Unuko-Orchestrator/1.0'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`[ALERT SENT]: ${event.code} successfully notified to Webhook`);
    } catch (err) {
      // Importante: No bloqueamos el flujo principal si falla la notificación
      console.error(`[ALERT FAILED]: Could not notify ${this.webhookUrl}. Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}