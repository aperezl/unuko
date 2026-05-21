import { describe, it, expect } from 'vitest';
import { SgpResponseHeaderSchema } from './types';
import { MOCK_HEADERS } from './constants';

describe('smdp-mockv2 - Base Schema Validation', () => {

  it('should accept a valid request with EUICC Challenge', () => {
    const result = SgpResponseHeaderSchema.safeParse(MOCK_HEADERS.SUCCESS);
    expect(result.success).toBe(true);
  });

  it('should fail if the EUICC Challenge is not valid', () => {
    const badHeader = {
      functionExecutionStatus: { status: "PENDING_RESPONSE" }
    };
    const result = SgpResponseHeaderSchema.safeParse(badHeader);
    expect(result.success).toBe(false);
  });

});