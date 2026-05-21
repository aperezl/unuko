import { describe, it, expect } from 'vitest';
import { Sgp32ResponseHeaderSchema } from './types';
import { MOCK_SGP32_HEADERS } from './constants';

describe('smdp-mockv2 [SGP.32] - Base Contract Validation', () => {

  it('should validate header structure successfully', () => {
    const result = Sgp32ResponseHeaderSchema.safeParse(MOCK_SGP32_HEADERS.SUCCESS);
    expect(result.success).toBe(true);
  });

  it('should reject states that violate IoT PRD conventions', () => {
    const corruptHeader = {
      functionExecutionStatus: { status: "ACTION_REQUIRED" }
    };
    const result = Sgp32ResponseHeaderSchema.safeParse(corruptHeader);
    expect(result.success).toBe(false);
  });

});