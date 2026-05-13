import { NotificationPort, AlertEvent } from '@unuko/core';
export declare class WebhookNotificationAdapter implements NotificationPort {
    private webhookUrl;
    constructor(webhookUrl: string);
    notify(event: AlertEvent): Promise<void>;
}
