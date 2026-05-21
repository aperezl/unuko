import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { releaseProfile } from './releaseProfile';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES2+ releaseProfile Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept a valid request and return the success header', () => {
    const req = { body: { iccid: "89049032000001234567" } } as Request;
    const res = makeMockResponse();

    releaseProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({ header: MOCK_HEADERS.SUCCESS });
  });
});