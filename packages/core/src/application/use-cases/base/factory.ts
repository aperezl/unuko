import { setup, assign } from 'xstate';
import { AlertSeverity } from '../../../domain/ports/out/NotificationPort';
import { WorkflowBaseContext, WorkflowPorts, StandardWorkflowEvent } from '../../../domain/models/workflow.types';

interface UnukoWorkflowConfig<TContext extends WorkflowBaseContext> {
  id: string;
  initial: string;
  context: TContext;
  states: any; 
}

export const createUnukoMachine = <TContext extends WorkflowBaseContext>(
  config: UnukoWorkflowConfig<TContext>,
  ports: WorkflowPorts
) => {
  return setup({
    types: {
      context: {} as TContext,
      events: {} as StandardWorkflowEvent | { type: string; [key: string]: any }
    },
    actions: {
      logSuccess: async () => {
        await ports.audit.log({
          sessionId: ports.sessionId,
          category: 'WORKFLOW',
          level: 'INFO',
          direction: 'INTERNAL',
          payload: { status: 'SUCCESS' },
          description: `Workflow ${config.id} Completed Successfully`
        });
      },
      logFailure: async ({ context }: { context: any }) => {
        await ports.audit.log({
          sessionId: ports.sessionId,
          category: 'WORKFLOW',
          level: 'ERROR',
          direction: 'INTERNAL',
          payload: { status: 'FAILURE', error: context.error },
          description: `Workflow ${config.id} Failed: ${context.error}`
        });
      },
      notifyRetry: async ({ context }: { context: any }) => {
        // En XState v5, las acciones ven el contexto ANTES del assign de la misma transición.
        // Por eso sumamos 1 manualmente para el mensaje o simplemente confiamos en que el siguiente estado lo verá.
        const nextRetry = (context.retryCount || 0);
        await ports.notification.notify({
          sessionId: ports.sessionId,
          code: 'RETRYING',
          message: `Automatic retry ${nextRetry}/3 due to: ${context.error}`,
          severity: AlertSeverity.WARNING,
          timestamp: new Date()
        });
      },
      notifySuccess: async () => {
        await ports.notification.notify({
          sessionId: ports.sessionId,
          code: 'SUCCESS',
          message: 'Process completed successfully',
          severity: AlertSeverity.INFO,
          timestamp: new Date()
        });
      },
      notifyFailure: async ({ context }: { context: any }) => {
        await ports.notification.notify({
          sessionId: ports.sessionId,
          code: 'FAILED',
          message: `Critical Failure: ${context.error}`,
          severity: AlertSeverity.CRITICAL,
          payload: { context },
          timestamp: new Date()
        });
      }
    }
  }).createMachine({
    id: config.id,
    initial: config.initial,
    context: {
      ...config.context,
      retryCount: config.context.retryCount || 0,
      error: config.context.error || null,
    } as TContext,
    states: {
      ...config.states,

      evaluating_error: {
        always: [
          {
            guard: ({ context }: { context: TContext }) => {
              const count = (context as any).retryCount || 0;
              return count < 3;
            },
            target: config.initial,
            actions: [
              // El assign en XState v5 se procesa después de las guardas
              assign(({ context }) => ({
                retryCount: ((context as any).retryCount || 0) + 1
              })),
              'notifyRetry'
            ]
          },
          { target: 'failure' }
        ]
      },

      done: {
        type: 'final',
        entry: ['logSuccess', 'notifySuccess']
      },

      failure: {
        entry: ['logFailure', 'notifyFailure'],
        on: {
          RETRY: {
            target: config.initial,
            actions: assign({ retryCount: 0, error: null })
          }
        }
      }
    }
  });
};
