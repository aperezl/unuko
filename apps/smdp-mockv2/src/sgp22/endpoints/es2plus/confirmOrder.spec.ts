import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { confirmOrder } from './confirmOrder';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES2+ confirmOrder Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should confirm the order and return the matchingId if the ICCID and EID are valid', () => {
    const req = {
      body: {
        iccid: "89049032000001234567",
        eid: "89049032000001234567890123456789"
      }
    } as Request;

    const res = makeMockResponse();

    confirmOrder(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      header: MOCK_HEADERS.SUCCESS,
      matchingId: "MATCHING-89049032000001234567-UNUKO-2026"
    });
  });

  it('should reject the confirmation with an HTTP 400 if the ICCID is too short', () => {
    const req = {
      body: {
        iccid: "8904_SHORT",
        eid: "89049032000001234567890123456789"
      }
    } as Request;

    const res = makeMockResponse();

    confirmOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid Request Payload - Error en validación de confirmación ES2+",
        details: expect.any(Object)
      })
    );
  });

});