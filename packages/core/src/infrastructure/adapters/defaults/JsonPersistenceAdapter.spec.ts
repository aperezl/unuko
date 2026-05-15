import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JsonPersistenceAdapter } from './JsonPersistenceAdapter';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('JsonPersistenceAdapter', () => {
  let testDir: string;
  let adapter: JsonPersistenceAdapter;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `unuko-persistence-test-${Math.random().toString(36).substring(7)}`);
    await fs.mkdir(testDir, { recursive: true });
    adapter = new JsonPersistenceAdapter(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should save and load a session snapshot', async () => {
    const sessionId = 'session-1';
    const snapshot = {
      value: 'authenticating',
      context: { imsi: '12345' },
      status: 'In Progress'
    };

    await adapter.saveSession(sessionId, snapshot);
    const loaded = await adapter.loadSession(sessionId);

    expect(loaded).toEqual(snapshot);
  });

  it('should list sessions sorted by updatedAt', async () => {
    await adapter.saveSession('sess-old', { value: 'done', context: {}, status: 'done' });
    // Small delay to ensure different updatedAt
    await new Promise(r => setTimeout(r, 10));
    await adapter.saveSession('sess-new', { value: 'active', context: {}, status: 'active' });

    const sessions = await adapter.listSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].sessionId).toBe('sess-new');
    expect(sessions[1].sessionId).toBe('sess-old');
  });

  it('should delete a session file', async () => {
    const sessionId = 'session-to-delete';
    await adapter.saveSession(sessionId, { value: 'ok', context: {}, status: 'ok' });
    await adapter.deleteSession(sessionId);

    const loaded = await adapter.loadSession(sessionId);
    expect(loaded).toBeNull();
  });
});
