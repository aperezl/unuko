import { SubscriberRepository } from '../../core/ports/SubscriberRepository';
import { Subscriber } from '../../core/domain/subscriber.types';
import { APP_CONFIG } from '../config/app.config';

export class HttpSubscriberRepository implements SubscriberRepository {
  async getSubscribers(): Promise<Subscriber[]> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SUBSCRIBERS);
    if (!response.ok) throw new Error('Failed to fetch subscribers');
    return response.json();
  }

  async getSubscriber(imsi: string): Promise<Subscriber> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SUBSCRIBER_DETAIL(imsi));
    if (!response.ok) throw new Error(`Failed to fetch subscriber ${imsi}`);
    return response.json();
  }

  async saveSubscriber(subscriber: Subscriber): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SUBSCRIBERS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriber)
    });
    if (!response.ok) throw new Error('Failed to save subscriber');
    return response.json();
  }

  async deleteSubscriber(imsi: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SUBSCRIBER_DETAIL(imsi), {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete subscriber ${imsi}`);
    return response.json();
  }
}

export const subscriberRepository = new HttpSubscriberRepository();
