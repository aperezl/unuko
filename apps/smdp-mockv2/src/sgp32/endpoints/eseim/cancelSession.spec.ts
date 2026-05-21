import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { cancelSessionEim } from './cancelSession';
import { MOCK_SGP32_HEADERS } from '../../constants';

describe('smdp-mockv2 [SGP.32] - ESeim cancelSession Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept the cancellation request if the eIM provides a standardized reason', () => {
    const req = {
      body: {
        transactionId: "tx-iot-2026-unuko-v12",
        eimId: "eim-root-server-global-01",
        cancelReason: "eimTimeout"
      }
    } as Request;

    const res = makeMockResponse();

    cancelSessionEim(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      header: MOCK_SGP32_HEADERS.SUCCESS
    });
  });

  it('should reject the operation with HTTP 400 if the cancellation reason is not compliant with SGP.32', () => {
    const req = {
      body: {
        transactionId: "tx-iot-2026-unuko-v12",
        eimId: "eim-root-server-global-01",
        cancelReason: "FORCE_QUIT_UNKNOWN"
      }
    } as Request;

    const res = makeMockResponse();

    cancelSessionEim(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});