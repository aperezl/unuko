import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { authenticateClientIot } from './authenticateClient';
import { MOCK_SGP32_DATA, MOCK_SGP32_HEADERS } from '../../constants';

describe('smdp-mockv2 [SGP.32] - ESipa authenticateClient Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should process successfully if the IoT eUICC signature comes in valid Base64', () => {
    const req = {
      body: {
        transactionId: "tx-iot-2026-unuko-v12",
        authenticateServerResponse: "Ym9yZGVyY29sbGllLXdhbHQtaW90LWF1dGg="
      }
    } as Request;

    const res = makeMockResponse();

    authenticateClientIot(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        header: MOCK_SGP32_HEADERS.SUCCESS,
        transactionId: "tx-iot-2026-unuko-v12",
        smdpSignature2: MOCK_SGP32_DATA.SERVER_SIGNATURE_1
      })
    );
  });

  it('should return HTTP 400 if the cryptographic payload is corrupt', () => {
    const req = {
      body: {
        transactionId: "tx-iot-2026-unuko-v12",
        authenticateServerResponse: "!!!INVALID_CHARACTERS_IOT!!!"
      }
    } as Request;

    const res = makeMockResponse();

    authenticateClientIot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});