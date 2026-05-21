import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { provideEID } from './provideEID';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES2+ provideEID Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should associate the EID with success if it complies with the 32-digit format', () => {
    const req = {
      body: {
        iccid: "89049032000001234567",
        eid: "89049032000001234567890123456789"
      }
    } as Request;
    const res = makeMockResponse();

    provideEID(req, res);

    expect(res.json).toHaveBeenCalledWith({ header: MOCK_HEADERS.SUCCESS });
  });
});