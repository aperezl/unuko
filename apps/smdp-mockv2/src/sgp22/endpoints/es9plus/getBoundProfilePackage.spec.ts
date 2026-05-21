import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { getBoundProfilePackage } from './getBoundProfilePackage';
import { MOCK_DATA, MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES9+ getBoundProfilePackage Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept the request to download with a correct Base64 and return the Bound Profile Package', () => {
    const req = {
      body: {
        transactionId: "tx-2026-smdp-mock-v2",
        prepareDownloadResponse: "V0FMVF9CT1JERVJfQ09MTElF"
      }
    } as Request;

    const res = makeMockResponse();

    getBoundProfilePackage(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        header: MOCK_HEADERS.SUCCESS,
        transactionId: "tx-2026-smdp-mock-v2",
        boundProfilePackage: MOCK_DATA.BOUND_PROFILE_PACKAGE
      })
    );
  });

  it('should return HTTP 400 if the prepareDownloadResponse parameter is not Base64', () => {
    const req = {
      body: {
        transactionId: "tx-2026-smdp-mock-v2",
        prepareDownloadResponse: "---CADENA_CON_CARACTERES_PROHIBIDOS---"
      }
    } as Request;

    const res = makeMockResponse();

    getBoundProfilePackage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid Request Payload - Error en serialización ASN.1/Base64 de descarga de perfil",
        details: expect.any(Object)
      })
    );
  });

});