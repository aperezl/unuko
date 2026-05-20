import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { environmentRepository } from '../../infrastructure/adapters/HttpEnvironmentRepository';

vi.mock('../../infrastructure/adapters/HttpEnvironmentRepository', () => ({
  environmentRepository: {
    getEnvironment: vi.fn(),
    setEnvironment: vi.fn()
  }
}));

describe('DashboardLayout Template', () => {
  const reloadSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', { reload: reloadSpy });
    localStorage.clear();
  });

  it('renders layout and handles environment toggle', async () => {
    vi.mocked(environmentRepository.getEnvironment).mockResolvedValue('mock');
    vi.mocked(environmentRepository.setEnvironment).mockResolvedValue({ environment: 'lima' });

    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );

    // Initial environment value mock button should have default variant
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    const mockBtn = screen.getByRole('button', { name: 'Mock' });
    const limaBtn = screen.getByRole('button', { name: 'LIMA (5G)' });

    expect(mockBtn).toBeInTheDocument();
    expect(limaBtn).toBeInTheDocument();

    // Toggle environment to LIMA
    fireEvent.click(limaBtn);

    await waitFor(() => {
      expect(environmentRepository.setEnvironment).toHaveBeenCalledWith('lima');
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  it('collapses and expands sidebar navigation', async () => {
    vi.mocked(environmentRepository.getEnvironment).mockResolvedValue('mock');

    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument();
    });

    const collapseBtn = screen.getByTitle('Collapse Sidebar');
    fireEvent.click(collapseBtn);

    // Side navigation is now collapsed, Sessions text should be gone
    expect(screen.queryByText('Sessions')).not.toBeInTheDocument();
    expect(localStorage.getItem('unuko-sidebar-collapsed')).toBe('true');
  });
});
