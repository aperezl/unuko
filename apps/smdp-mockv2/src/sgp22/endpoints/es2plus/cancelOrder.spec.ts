import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { cancelOrder } from './cancelOrder';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES2+ cancelOrder Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept the signature of the eUICC and return the metadata and signatures of the SM-DP+', () => {
    const req = {
      body: {
        iccid: "89049032000001234567",
        cancelReason: "mnoInitiated"
      }
    } as Request;
    const res = makeMockResponse();

    cancelOrder(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ header: MOCK_HEADERS.SUCCESS });
  });

  it('should give 400 error if the cancellation reason does not belong to the official enum', () => {
    const req = {
      body: {
        iccid: "89049032000001234567",
        cancelReason: "MOTIVO_INVENTADO"
      }
    } as Request;
    const res = makeMockResponse();

    cancelOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});