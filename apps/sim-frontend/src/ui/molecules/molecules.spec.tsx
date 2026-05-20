import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from './FormField';
import { MetricCard } from './MetricCard';
import { SearchInput } from './SearchInput';
import { TableHeaderCell } from './TableHeaderCell';

describe('UI Molecules', () => {
  describe('FormField', () => {
    it('renders label, children, description, and error message', () => {
      render(
        <FormField label="Username" description="Choose a unique name" error="Name already taken">
          <input data-testid="test-input" />
        </FormField>
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Choose a unique name')).toBeInTheDocument();
      expect(screen.getByText('Name already taken')).toBeInTheDocument();
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });
  });

  describe('MetricCard', () => {
    it('renders title, value, description, and icon', () => {
      render(
        <MetricCard
          title="CPU Usage"
          value="42%"
          description="Average CPU utilization"
          icon={<span data-testid="icon">icon</span>}
        />
      );

      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
      expect(screen.getByText('42%')).toBeInTheDocument();
      expect(screen.getByText('Average CPU utilization')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('SearchInput', () => {
    it('renders input with search icon', () => {
      const handleChange = vi.fn();
      render(<SearchInput placeholder="Search..." onChange={handleChange} />);

      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
      expect(input.className).toContain('pl-9'); // Indented for search icon

      fireEvent.change(input, { target: { value: 'query' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('TableHeaderCell', () => {
    it('renders inside a table and displays text', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHeaderCell>Header Text</TableHeaderCell>
            </tr>
          </thead>
        </table>
      );

      const cell = screen.getByText('Header Text');
      expect(cell).toBeInTheDocument();
      expect(cell.tagName).toBe('TH');
    });
  });
});
