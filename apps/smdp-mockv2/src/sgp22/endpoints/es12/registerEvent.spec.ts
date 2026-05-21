import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { registerEvent } from './registerEvent';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES12 registerEvent Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept a valid request and return the success header and allow device change', () => {
    const req = {
      body: {
        eid: "89049032000001234567890123456789",
        smdpAddress: "rsp.unuko.io"
      }
    } as Request;
    const res = makeMockResponse();

    registerEvent(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        header: MOCK_HEADERS.SUCCESS,
        eventId: expect.any(String)
      })
    );
  });
});