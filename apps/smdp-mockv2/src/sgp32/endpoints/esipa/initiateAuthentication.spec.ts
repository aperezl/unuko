import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { initiateAuthenticationIot } from './initiateAuthentication';
import { MOCK_SGP32_DATA, MOCK_SGP32_HEADERS } from '../../constants';

describe('smdp-mockv2 [SGP.32] - ESipa initiateAuthentication Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept a valid handshake from an IoT IPA component', () => {
    const req = {
      body: {
        euiccChallenge: "SU9UX0JPUkRFUl9DT0xMSUVfMjAyNg==",
        smdpAddress: "iot-rsp.unuko.io",
        euiccInfo1: "pyGBIKAgv0GBIJAgm0GBAw==",
        cryptoCapability: "gSCAwAAgMCAA"
      }
    } as Request;

    const res = makeMockResponse();

    initiateAuthenticationIot(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        header: MOCK_SGP32_HEADERS.SUCCESS,
        transactionId: MOCK_SGP32_DATA.TRANSACTION_ID,
        serverSigned1: {
          transactionId: MOCK_SGP32_DATA.TRANSACTION_ID,
          smdpAddress: "iot-rsp.unuko.io",
          euiccChallenge: "SU9UX0JPUkRFUl9DT0xMSUVfMjAyNg=="
        }
      })
    );
  });

  it('should reject authentication if the mandatory cryptoCapability block is missing in IoT', () => {
    const req = {
      body: {
        euiccChallenge: "SU9UX0JPUkRFUl9DT0xMSUVfMjAyNg==",
        smdpAddress: "iot-rsp.unuko.io",
        euiccInfo1: "pyGBIKAgv0GBIJAgm0GBAw=="
        // missing cryptoCapability
      }
    } as Request;

    const res = makeMockResponse();

    initiateAuthenticationIot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});