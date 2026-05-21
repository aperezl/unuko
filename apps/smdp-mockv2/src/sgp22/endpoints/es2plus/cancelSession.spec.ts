import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { cancelSessionMno } from './cancelSession';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES2+ cancelSession Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should process the operator cancellation correctly', () => {
    const req = {
      body: {
        transactionId: "tx-777",
        iccid: "89049032000001234567",
        reason: "MNO Admin Intervention"
      }
    } as Request;
    const res = makeMockResponse();

    cancelSessionMno(req, res);

    expect(res.json).toHaveBeenCalledWith({ header: MOCK_HEADERS.SUCCESS });
  });
});