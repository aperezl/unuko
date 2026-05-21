import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { loadBoundProfilePackage } from './loadBoundProfilePackage';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES21 loadBoundProfilePackage Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept the mass injection of corporate bound profiles', () => {
    const req = {
      body: {
        transactionId: "tx-corp-999",
        boundProfilePackage: "V0FMVF9CT1JERVJfQ09MTElF"
      }
    } as Request;
    const res = makeMockResponse();

    loadBoundProfilePackage(req, res);

    expect(res.json).toHaveBeenCalledWith({ header: MOCK_HEADERS.SUCCESS });
  });
});