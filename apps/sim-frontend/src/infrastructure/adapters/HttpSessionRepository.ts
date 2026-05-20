import { SessionRepository } from '../../core/ports/SessionRepository';
import { SessionSummary, SessionData } from '../../core/domain/session.types';
import { APP_CONFIG } from '../config/app.config';

export class HttpSessionRepository implements SessionRepository {
  async getSessions(): Promise<SessionSummary[]> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SESSIONS);
    if (!response.ok) throw new Error('Failed to fetch sessions');
    const json = await response.json();
    return Array.isArray(json) ? json : [];
  }

  async getSession(id: string): Promise<SessionData> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SESSION_DETAIL(id));
    if (!response.ok) throw new Error(`Failed to fetch session ${id}`);
    return response.json();
  }

  async createSession(workflow: string, workflowDefinition?: any): Promise<string> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SESSION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, workflowDefinition })
    });
    if (!response.ok) throw new Error('Failed to create session');
    const json = await response.json();
    if (!json || !json.sessionId) {
      throw new Error('Response did not contain sessionId');
    }
    return json.sessionId;
  }

  async deleteSession(id: string): Promise<any> {
    const response = await fetch(APP_CONFIG.ENDPOINTS.SESSION_DETAIL(id), { method: 'DELETE' });
    if (!response.ok) throw new Error(`Failed to delete session ${id}`);
    return response.json();
  }
}

export const sessionRepository = new HttpSessionRepository();
