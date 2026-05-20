import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageHeader } from './PageHeader';
import { SidebarNavigation } from './SidebarNavigation';

describe('UI Organisms', () => {
  describe('PageHeader', () => {
    it('renders title, highlight, subtitle, and actions', () => {
      render(
        <PageHeader
          title="Overview"
          highlight="Device"
          subtitle="Details of dev"
          actions={<button>Action</button>}
        />
      );

      expect(screen.getByText(/Overview/)).toBeInTheDocument();
      expect(screen.getByText('Device')).toBeInTheDocument();
      expect(screen.getByText('Details of dev')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('SidebarNavigation', () => {
    it('renders navigation links and toggles state', () => {
      const handleToggle = vi.fn();
      render(
        <MemoryRouter initialEntries={['/']}>
          <SidebarNavigation collapsed={false} onToggle={handleToggle} />
        </MemoryRouter>
      );

      expect(screen.getByText('Sessions')).toBeInTheDocument();
      expect(screen.getByText('Designer')).toBeInTheDocument();
      expect(screen.getByText('Inventory')).toBeInTheDocument();
      
      const toggleBtn = screen.getByTitle('Collapse Sidebar');
      fireEvent.click(toggleBtn);
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('renders collapsed state cleanly without text descriptions', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <SidebarNavigation collapsed={true} onToggle={() => {}} />
        </MemoryRouter>
      );

      expect(screen.queryByText('Sessions')).not.toBeInTheDocument();
      expect(screen.queryByText('Designer')).not.toBeInTheDocument();
    });
  });
});
