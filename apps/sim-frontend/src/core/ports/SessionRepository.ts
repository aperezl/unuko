import { SessionSummary, SessionData } from '../domain/session.types';

export interface SessionRepository {
  getSessions(): Promise<SessionSummary[]>;
  getSession(id: string): Promise<SessionData>;
  createSession(workflow: string, workflowDefinition?: any): Promise<string>;
  deleteSession(id: string): Promise<any>;
}
