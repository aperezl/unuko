import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { handleNotification } from './handleNotification';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES9+ handleNotification Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should confirm reception if the pendingNotification token is a valid Base64', () => {
    const req = {
      body: {
        pendingNotification: "V0FMVF9CT1JERVJfQ09MTElF"
      }
    } as Request;

    const res = makeMockResponse();

    handleNotification(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      header: MOCK_HEADERS.SUCCESS
    });
  });

  it('should return an HTTP 400 if the notification parameter is corrupt', () => {
    const req = {
      body: {
        pendingNotification: "!!!CADENA_DE_NOTIFICACION_INVALIDA_888"
      }
    } as Request;

    const res = makeMockResponse();

    handleNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid Request Payload - Error en serialización ASN.1/Base64 de notificación",
        details: expect.any(Object)
      })
    );
  });

});