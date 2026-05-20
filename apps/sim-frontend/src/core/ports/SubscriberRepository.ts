import { Subscriber } from '../domain/subscriber.types';

export interface SubscriberRepository {
  getSubscribers(): Promise<Subscriber[]>;
  getSubscriber(imsi: string): Promise<Subscriber>;
  saveSubscriber(subscriber: Subscriber): Promise<any>;
  deleteSubscriber(imsi: string): Promise<any>;
}
