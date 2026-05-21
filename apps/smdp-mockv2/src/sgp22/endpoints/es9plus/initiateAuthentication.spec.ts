import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { initiateAuthentication } from './initiateAuthentication';
import { MOCK_DATA, MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES9+ initiateAuthentication Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept a valid request with EUICC Challenge and return the official response', () => {
    const req = {
      body: {
        euiccChallenge: "V0FMVF9CT1JERVJfQ09MTElF",
        smdpAddress: "rsp.unuko.io",
        euiccInfo1: "pyGBIKAgv0GBIJAgm0GBAw==",
        lpaRspCapability: "gSCAwAAgMCAA"
      }
    } as Request;

    const res = makeMockResponse();

    initiateAuthentication(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        header: MOCK_HEADERS.SUCCESS,
        transactionId: MOCK_DATA.TRANSACTION_ID,
        serverSigned1: {
          transactionId: MOCK_DATA.TRANSACTION_ID,
          smdpAddress: "rsp.unuko.io",
          euiccChallenge: "V0FMVF9CT1JERVJfQ09MTElF"
        },
        serverSignature1: MOCK_DATA.SERVER_SIGNATURE_1,
        euiccCiPKIdToBeUsed: MOCK_DATA.CI_PK_ID,
        serverCertificate: MOCK_DATA.SERVER_CERTIFICATE
      })
    );
  });

  it('should return HTTP 400 if euiccInfo1 is not a valid Base64 string', () => {
    const req = {
      body: {
        euiccChallenge: "V0FMVF9CT1JERVJfQ09MTElF",
        smdpAddress: "rsp.unuko.io",
        euiccInfo1: "---ESTO_NO_ES_BASE64_VALIDO---"
      }
    } as Request;

    const res = makeMockResponse();

    initiateAuthentication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid Request Payload - Error en serialización ASN.1/Base64 del protocolo",
        details: expect.any(Object)
      })
    );
  });

});