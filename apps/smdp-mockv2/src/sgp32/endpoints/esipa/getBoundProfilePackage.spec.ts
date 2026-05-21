import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { getBoundProfilePackageIot } from './getBoundProfilePackage';
import { MOCK_SGP32_DATA, MOCK_SGP32_HEADERS } from '../../constants';

describe('smdp-mockv2 [SGP.32] - ESipa getBoundProfilePackage Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should return the Bound Profile Package if the IPA sends a valid download preparation', () => {
    const req = {
      body: {
        transactionId: "tx-iot-2026-unuko-v12",
        prepareDownloadResponse: "Ym9yZGVyY29sbGllLWlvdC1wcmVwYXJlLWRvd25sb2Fk"
      }
    } as Request;

    const res = makeMockResponse();

    getBoundProfilePackageIot(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        header: MOCK_SGP32_HEADERS.SUCCESS,
        transactionId: "tx-iot-2026-unuko-v12",
        boundProfilePackage: MOCK_SGP32_DATA.BOUND_PROFILE_PACKAGE_IOT
      })
    );
  });

  it('should return HTTP 400 if prepareDownloadResponse violates Base64 syntax rules', () => {
    const req = {
      body: {
        transactionId: "tx-iot-2026-unuko-v12",
        prepareDownloadResponse: "---BAD_CHARACTERS---"
      }
    } as Request;

    const res = makeMockResponse();

    getBoundProfilePackageIot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});