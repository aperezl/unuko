// src/sgp22/endpoints/es9plus/authenticateClient.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { authenticateClient } from './authenticateClient';
import { MOCK_DATA, MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES9+ authenticateClient Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept the signature of the eUICC in Base64 and return the metadata and signatures of the SM-DP+', () => {
    const req = {
      body: {
        transactionId: "tx-2026-smdp-mock-v2",
        authenticateServerResponse: "V0FMVF9CT1JERVJfQ09MTElF"
      }
    } as Request;

    const res = makeMockResponse();

    authenticateClient(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        header: MOCK_HEADERS.SUCCESS,
        transactionId: "tx-2026-smdp-mock-v2",
        profileMetadata: MOCK_DATA.PROFILE_METADATA,
        smdpSignature2: MOCK_DATA.SMDP_SIGNATURE_2,
        smdpCertificate: MOCK_DATA.SERVER_CERTIFICATE
      })
    );
  });

  it('debería retornar HTTP 400 si authenticateServerResponse no cumple el formato Base64', () => {
    const req = {
      body: {
        transactionId: "tx-2026-smdp-mock-v2",
        authenticateServerResponse: "!!!CADENA_CON_CARACTERES_INVALIDOS!!!"
      }
    } as Request;

    const res = makeMockResponse();

    authenticateClient(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid Request Payload - Error en serialización ASN.1/Base64 de autenticación",
        details: expect.any(Object)
      })
    );
  });

});