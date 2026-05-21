import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { handleNotificationIot } from './handleNotification';
import { MOCK_SGP32_HEADERS } from '../../constants';

describe('smdp-mockv2 [SGP.32] - ESipa handleNotification Endpoint', () => {

  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept the notification if it contains a valid Base64 block', () => {
    const req = {
      body: {
        pendingNotification: "Ym9yZGVyY29sbGllLWlvdC1pbnN0YWxsLXN1Y2Nlc3M="
      }
    } as Request;

    const res = makeMockResponse();

    handleNotificationIot(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      header: MOCK_SGP32_HEADERS.SUCCESS
    });
  });

  it('should reject the confirmation with an HTTP 400 if the payload is malformed', () => {
    const req = {
      body: {
        pendingNotification: "!!!NOTIFICACION_CORRUPTA_IOT!!!"
      }
    } as Request;

    const res = makeMockResponse();

    handleNotificationIot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});