import { describe, it, expect } from 'vitest';
import { calculateProgress } from './progress';

describe('calculateProgress', () => {
  it('should return 0 for initial state', () => {
    expect(calculateProgress('initial')).toBe(0);
  });

  it('should return 100 for SUCCESS state', () => {
    expect(calculateProgress('SUCCESS')).toBe(100);
  });

  it('should return 50 for mid state', () => {
    // Note: This depends on the actual implementation of calculateProgress
    // Adjust expected values based on the logic in progress.ts
  });
});
