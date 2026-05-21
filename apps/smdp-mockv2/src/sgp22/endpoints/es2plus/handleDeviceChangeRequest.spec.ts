import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { handleDeviceChangeRequest } from './handleDeviceChangeRequest';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES2+ handleDeviceChangeRequest Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept a valid request and return the success header and allow device change', () => {
    const req = {
      body: {
        iccid: "89049032000001234567",
        targetEid: "89049032000001234567890123456789",
        deviceChangeId: "dev-change-uuid-2026"
      }
    } as Request;
    const res = makeMockResponse();

    handleDeviceChangeRequest(req, res);

    expect(res.json).toHaveBeenCalledWith({
      header: MOCK_HEADERS.SUCCESS,
      deviceChangeAuthorized: true
    });
  });
});