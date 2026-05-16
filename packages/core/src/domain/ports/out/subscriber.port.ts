import { Subscriber } from '../../models/network.types';

export interface SubscriberPort {
  findAll(): Promise<Subscriber[]>;
  findById(imsi: string): Promise<Subscriber | undefined>;
  upsert(subscriber: Subscriber): Promise<void>;
  delete(imsi: string): Promise<void>;
}
