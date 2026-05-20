import { createActor, AnyActor } from 'xstate';
import {
  unukoEngine,
  createSGP22Machine,
  createInventoryMachine,
  createProfileMgmtMachine,
  createNotificationMachine,
  createTestMachine,
  HardwareAuditOutboundAdapter,
  TransportAuditOutboundAdapter
} from '@unuko/core';
import { container } from '../../infrastructure/di/DependencyContainer.js';

export class SessionUseCase {
  private activeActors = new Map<string, AnyActor>();

  async listSessions() {
    const sessions = await container.getActivePersistence().listSessions();
    return sessions?.map(s => ({
      sessionId: s.sessionId,
      status: s.status,
      updatedAt: s.updatedAt
    })) || [];
  }

  async getSessionDetails(id: string) {
    return await container.getActiveInspector().getFullDetails(id);
  }

  async sendSessionEvent(id: string, event: string) {
    const actor = this.activeActors.get(id);
    if (!actor) {
      throw new Error('Active actor not found for this session');
    }
    actor.send({ type: event as any });
    return { status: 'event_processed', event };
  }

  async deleteSession(id: string) {
    // Detener actor si está activo
    const actor = this.activeActors.get(id);
    if (actor) {
      actor.stop();
      this.activeActors.delete(id);
    }

    await container.getActivePersistence().deleteSession(id);
    await container.getActiveFileAudit().deleteAuditLogs(id);
    return { status: 'deleted', sessionId: id };
  }

  async startSession(sessionId: string, workflow: string = 'provisioning', snapshot?: any, workflowDefinition?: any) {
    console.log(`[SYSTEM]: Starting ${workflowDefinition ? 'dynamic' : workflow} session ${sessionId}...`);

    const activeAudit = container.getActiveAudit();
    const activePersistence = container.getActivePersistence();
    const rawHardware = container.getRawHardware();
    const rawTransport = container.getRawTransport();
    const crypto = container.getCrypto();
    const notification = container.getNotification();
    const network = container.getActiveNetwork();

    const hardware = new HardwareAuditOutboundAdapter(rawHardware, activeAudit, sessionId);
    const transport = new TransportAuditOutboundAdapter(rawTransport, activeAudit, sessionId);

    let machine;
    if (workflowDefinition) {
      machine = unukoEngine.createMachine(workflowDefinition, {
        hardware,
        crypto,
        transport,
        audit: activeAudit,
        notification,
        network,
        sessionId
      });
    } else {
      const machineMap: Record<string, any> = {
        provisioning: createSGP22Machine,
        inventory: createInventoryMachine,
        'profile-mgmt': createProfileMgmtMachine,
        notification: createNotificationMachine,
        'test-services': createTestMachine
      };
      const factory = machineMap[workflow] || createSGP22Machine;
      machine = factory({
        hardware,
        crypto,
        transport,
        audit: activeAudit,
        notification,
        network,
        sessionId
      });
    }

    const actor = createActor(machine, {
      snapshot: snapshot || undefined
    });

    actor.subscribe(async (state) => {
      const currentState = typeof state.value === 'string' ? state.value : JSON.stringify(state.value);
      console.log(`[${sessionId}]: ${currentState}`);

      try {
        await activeAudit.log({
          sessionId,
          category: 'WORKFLOW',
          level: 'INFO',
          direction: 'INTERNAL',
          payload: { state: currentState },
          description: `State transitioned to: ${currentState}`
        });
      } catch (err) {
        console.error(`[${sessionId}]: Failed to write state transition log:`, err);
      }

      const currentSnapshot = actor.getSnapshot();
      await activePersistence.saveSession(sessionId, {
        value: currentSnapshot.value,
        context: currentSnapshot.context,
        status: currentSnapshot.status
      });

      if (state.matches('done') || state.matches('failure')) {
        this.activeActors.delete(sessionId);
      }
    });

    this.activeActors.set(sessionId, actor);
    actor.start();

    // Pequeño delay para asegurar que el primer guardado se procese
    await new Promise(resolve => setTimeout(resolve, 100));

    if (snapshot) {
      actor.send({ type: 'RESUME_WORKFLOW' });
    }

    return actor;
  }
}

export const sessionUseCase = new SessionUseCase();
