import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { deleteEvent } from './deleteEvent';
import { MOCK_HEADERS } from '../../constants';

describe('smdp-mockv2 - ES12 deleteEvent Endpoint', () => {
  const makeMockResponse = () => {
    const res = {} as Response;
    res.json = vi.fn().mockReturnValue(res);
    res.status = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should accept a valid request and return the success header', () => {
    const req = {
      body: {
        eventId: "event-ds-777",
        deletionReason: "resolved"
      }
    } as Request;
    const res = makeMockResponse();

    deleteEvent(req, res);

    expect(res.json).toHaveBeenCalledWith({ header: MOCK_HEADERS.SUCCESS });
  });
});