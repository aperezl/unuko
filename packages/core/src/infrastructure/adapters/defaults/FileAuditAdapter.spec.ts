import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileAuditAdapter } from './FileAuditAdapter';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('FileAuditAdapter', () => {
  let testDir: string;
  let adapter: FileAuditAdapter;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `unuko-test-${Math.random().toString(36).substring(7)}`);
    await fs.mkdir(testDir, { recursive: true });
    adapter = new FileAuditAdapter(testDir);
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should log an entry to a file', async () => {
    const sessionId = 'test-session-1';
    await adapter.log({
      sessionId,
      category: 'WORKFLOW',
      level: 'INFO',
      direction: 'INTERNAL',
      payload: { foo: 'bar' },
      description: 'Test log'
    });

    const logs = await adapter.getAuditLogs(sessionId);
    expect(logs).toHaveLength(1);
    expect(logs[0].sessionId).toBe(sessionId);
    expect(logs[0].description).toBe('Test log');
    expect(logs[0].payload).toEqual({ foo: 'bar' });
  });

  it('should return empty array if log file does not exist', async () => {
    const logs = await adapter.getAuditLogs('non-existent');
    expect(logs).toEqual([]);
  });

  it('should delete audit logs', async () => {
    const sessionId = 'test-session-delete';
    await adapter.log({
      sessionId,
      category: 'WORKFLOW',
      level: 'INFO',
      direction: 'INTERNAL',
      payload: {},
      description: 'To be deleted'
    });

    await adapter.deleteAuditLogs(sessionId);
    const logs = await adapter.getAuditLogs(sessionId);
    expect(logs).toEqual([]);
  });

  it('should append multiple logs to the same file', async () => {
    const sessionId = 'test-multi-log';
    await adapter.log({ sessionId, category: 'WORKFLOW', level: 'INFO', direction: 'INTERNAL', payload: {}, description: 'Log 1' });
    await adapter.log({ sessionId, category: 'WORKFLOW', level: 'INFO', direction: 'INTERNAL', payload: {}, description: 'Log 2' });

    const logs = await adapter.getAuditLogs(sessionId);
    expect(logs).toHaveLength(2);
    expect(logs[0].description).toBe('Log 1');
    expect(logs[1].description).toBe('Log 2');
  });
});
