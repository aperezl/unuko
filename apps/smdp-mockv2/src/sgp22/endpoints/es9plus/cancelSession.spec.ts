import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { cancelSession } from './cancelSession';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES9+ cancelSession Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should process cancellation correctly if payload comes in valid Base64', () => {
    const req = {
      body: {
        transactionId: "tx-2026-smdp-mock-v2",
        cancelSessionResponse: "V0FMVF9CT1JERVJfQ09MTElF"
      }
    } as Request;

    const res = makeMockResponse();

    cancelSession(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      header: MOCK_HEADERS.SUCCESS
    });
  });

  it('should return an HTTP 400 if cancelSessionResponse has a corrupt or invalid format', () => {
    const req = {
      body: {
        transactionId: "tx-2026-smdp-mock-v2",
        cancelSessionResponse: "!!!N0_QVRfQUxMX0JBU0U2NA=="
      }
    } as Request;

    const res = makeMockResponse();

    cancelSession(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid Request Payload - Error en serialización ASN.1/Base64 de cancelación",
        details: expect.any(Object)
      })
    );
  });

});