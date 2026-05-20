import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HexViewer } from './HexViewer';

describe('HexViewer Component', () => {
  it('renders string hexadecimal data correctly with offset and ascii', () => {
    // Hex representation of "Hello" is 48 65 6c 6c 6f
    render(<HexViewer data="48656c6c6f" />);

    expect(screen.getByText('Offset')).toBeInTheDocument();
    expect(screen.getByText('Hexadecimal')).toBeInTheDocument();
    expect(screen.getByText('ASCII')).toBeInTheDocument();

    // Check offset 0000
    expect(screen.getByText('0000')).toBeInTheDocument();

    // Check hex bytes render
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getAllByText('6C')).toHaveLength(2); // l occurs twice
    expect(screen.getByText('6F')).toBeInTheDocument();

    // Check ASCII conversion
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders Uint8Array data correctly', () => {
    const uintArray = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    render(<HexViewer data={uintArray} />);

    expect(screen.getByText('0000')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('LENGTH: 5 BYTES (0x5)')).toBeInTheDocument();
  });
});
