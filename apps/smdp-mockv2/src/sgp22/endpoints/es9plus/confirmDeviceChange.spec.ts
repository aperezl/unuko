import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { confirmDeviceChange } from './confirmDeviceChange';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES9+ confirmDeviceChange Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept a valid request and return the success header', () => {
    const req = {
      body: {
        transactionId: "tx-dev-change-2026",
        deviceChangeResponse: "V0FMVF9CT1JERVJfQ09MTElF"
      }
    } as Request;
    const res = makeMockResponse();

    confirmDeviceChange(req, res);

    expect(res.json).toHaveBeenCalledWith({ header: MOCK_HEADERS.SUCCESS });
  });
});