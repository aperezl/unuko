import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { eimTriggerDownload } from './eimTriggerDownload';
import { MOCK_SGP32_DATA, MOCK_SGP32_HEADERS } from '../../constants';

describe('smdp-mockv2 [SGP.32] - ESeim eimTriggerDownload Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should process the eIM trigger if the EID has the official 32-digit length', () => {
    const req = {
      body: {
        eid: "89049032000001234567890123456789",
        eimId: "eim-root-server-global-01",
        autoActivationRequired: true
      }
    } as Request;

    const res = makeMockResponse();

    eimTriggerDownload(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      header: MOCK_SGP32_HEADERS.SUCCESS,
      transactionId: MOCK_SGP32_DATA.TRANSACTION_ID,
      iccid: "89049032000009999999"
    });
  });

  it('should reject the trigger with HTTP 400 if the EID is malformed', () => {
    const req = {
      body: {
        eid: "EID_CORRUPTO_MIN_IOT",
        eimId: "eim-root-server-global-01"
      }
    } as Request;

    const res = makeMockResponse();

    eimTriggerDownload(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});