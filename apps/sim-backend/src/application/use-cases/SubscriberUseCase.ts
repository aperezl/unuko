import { container } from '../../infrastructure/di/DependencyContainer.js';

export class SubscriberUseCase {
  async listSubscribers() {
    return await container.getActiveSdm().findAll();
  }

  async getSubscriber(imsi: string) {
    const subscriber = await container.getActiveSdm().findById(imsi);
    if (!subscriber) {
      throw new Error('Subscriber not found');
    }
    return subscriber;
  }

  async upsertSubscriber(subscriber: any) {
    await container.getActiveSdm().upsert(subscriber);
    return { status: 'ok' };
  }

  async deleteSubscriber(imsi: string) {
    await container.getActiveSdm().delete(imsi);
    return { status: 'ok' };
  }
}

export const subscriberUseCase = new SubscriberUseCase();
