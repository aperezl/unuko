import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Input } from './Input';
import { Spinner } from './Spinner';
import { Switch } from './Switch';

describe('UI Atoms', () => {
  describe('Badge', () => {
    it('renders text and default styling', () => {
      render(<Badge>Test Badge</Badge>);
      const badge = screen.getByText('Test Badge');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('bg-primary');
    });

    it('renders secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge.className).toContain('bg-secondary');
    });
  });

  describe('Button', () => {
    it('renders children and handles clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports asChild rendering', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Input', () => {
    it('renders input field with value and handles change', () => {
      const handleChange = vi.fn();
      render(<Input id="username" placeholder="Enter username" onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Enter username') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      fireEvent.change(input, { target: { value: 'john' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('displays validation error and sets ARIA attributes', () => {
      render(<Input id="email" error="Invalid email address" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toHaveTextContent('Invalid email address');
    });
  });

  describe('Spinner', () => {
    it('renders and applies custom size', () => {
      const { container } = render(<Spinner size={24} data-testid="spinner" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.style.width).toBe('24px');
      expect(svg?.style.height).toBe('24px');
    });
  });

  describe('Switch', () => {
    it('renders as unchecked and calls onChange on click', () => {
      const handleChange = vi.fn();
      render(<Switch checked={false} onChange={handleChange} />);
      const btn = screen.getByRole('switch');
      expect(btn).toHaveAttribute('aria-checked', 'false');
      
      fireEvent.click(btn);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('renders as checked and does not call onChange if disabled', () => {
      const handleChange = vi.fn();
      render(<Switch checked={true} onChange={handleChange} disabled />);
      const btn = screen.getByRole('switch');
      expect(btn).toHaveAttribute('aria-checked', 'true');
      
      fireEvent.click(btn);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
