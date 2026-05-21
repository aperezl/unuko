import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { downloadOrder } from './downloadOrder';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES2+ downloadOrder Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should process the operator order if the EID has exactly 32 digits', () => {
    const req = {
      body: {
        eid: "89049032000001234567890123456789",
        profileType: "B2B_GENERIC"
      }
    } as Request;

    const res = makeMockResponse();

    downloadOrder(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      header: MOCK_HEADERS.SUCCESS,
      iccid: "89049032000001234567"
    });
  });

  it('should reject the request with an HTTP 400 if the EID does not have the correct format or length', () => {
    const req = {
      body: {
        eid: "8904_MALFORMED_EID",
      }
    } as Request;

    const res = makeMockResponse();

    downloadOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid Request Payload - Error en validación de parámetros de operador ES2+",
        details: expect.any(Object)
      })
    );
  });

});