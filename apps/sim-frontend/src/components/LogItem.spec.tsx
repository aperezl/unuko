import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogItem } from './LogItem';
import { LogEntry } from '../types';

describe('LogItem Component', () => {
  const mockLog: LogEntry = {
    _id: 'log-1',
    sessionId: 'session-1',
    timestamp: '2026-05-20T10:00:00.000Z',
    category: 'TRANSPORT',
    direction: 'OUT',
    description: 'Sending registration request',
    payload: {
      url: 'http://localhost/v1/register',
      body: { imsi: '123456789' },
      response: { success: true, apdu: '9000' },
      headers: { 'Content-Type': 'application/json' },
      _httpStatus: '200 OK',
      _rawBody: '{"success":true}'
    }
  };

  const writeTextSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: writeTextSpy
      }
    });
  });

  it('renders log summary correctly when collapsed', () => {
    render(
      <table>
        <tbody>
          <LogItem log={mockLog} isSelected={false} onClick={() => {}} />
        </tbody>
      </table>
    );

    // Verify category and description render
    expect(screen.getByText('TRANSPORT')).toBeInTheDocument();
    expect(screen.getByText('OUT')).toBeInTheDocument();
    expect(screen.getByText('Sending registration request')).toBeInTheDocument();
    expect(screen.getByText('SENT')).toBeInTheDocument();

    // Verify detail tabs are NOT visible
    expect(screen.queryByText('Response Body')).not.toBeInTheDocument();
  });

  it('calls onClick when row is clicked', () => {
    const handleClick = vi.fn();
    render(
      <table>
        <tbody>
          <LogItem log={mockLog} isSelected={false} onClick={handleClick} />
        </tbody>
      </table>
    );

    const row = screen.getByRole('row');
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders expanded details with tabs and copies URL', () => {
    render(
      <table>
        <tbody>
          <LogItem log={mockLog} isSelected={true} onClick={() => {}} />
        </tbody>
      </table>
    );

    // Verify tabs are present
    expect(screen.getByText('Response Body')).toBeInTheDocument();
    expect(screen.getByText('Request Body')).toBeInTheDocument();
    expect(screen.getByText('Network Headers')).toBeInTheDocument();
    expect(screen.getByText('Raw')).toBeInTheDocument();

    // Check signal URI bar is present
    expect(screen.getByText('http://localhost/v1/register')).toBeInTheDocument();

    // Test Copy URL button
    const copyUrlBtn = screen.getByRole('button', { name: 'Copy URL' });
    fireEvent.click(copyUrlBtn);
    expect(writeTextSpy).toHaveBeenCalledWith('http://localhost/v1/register');
  });

  it('toggles tabs to show request body, headers, and raw content', () => {
    render(
      <table>
        <tbody>
          <LogItem log={mockLog} isSelected={true} onClick={() => {}} />
        </tbody>
      </table>
    );

    // Defaults to Response Body, check apdu Hex Trace
    expect(screen.getByText('Forensic Hex Trace')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();

    // Switch to Request Body
    const requestTab = screen.getByText('Request Body');
    fireEvent.click(requestTab);
    expect(screen.getByText(/"imsi": "123456789"/)).toBeInTheDocument();

    // Switch to Network Headers
    const headersTab = screen.getByText('Network Headers');
    fireEvent.click(headersTab);
    expect(screen.getByText(/"Content-Type": "application\/json"/)).toBeInTheDocument();

    // Switch to Raw
    const rawTab = screen.getByText('Raw');
    fireEvent.click(rawTab);
    expect(screen.getByText(/STATUS: 200 OK/)).toBeInTheDocument();
    expect(screen.getByText(/\{"success":true\}/)).toBeInTheDocument();
  });
});
