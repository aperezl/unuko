import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app, { server } from './server';
import { MOCK_DATA } from './sgp22/constants';

describe('smdp-mockv2 - 100% SGP.22 Technical Specification Coverage', () => {

  afterAll(() => {
    if (server && typeof server.close === 'function') {
      server.close();
    }
  });

  describe('Global Aspects and Server Middlewares', () => {
    it('should inject X-Admin-Protocol header required by the GSMA in all requests', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/initiateAuthentication')
        .send({
          euiccChallenge: "V0FMVF9CT1JERVJfQ09MTElF",
          smdpAddress: "rsp.unuko.io",
          euiccInfo1: "pyGBIKAgv0GBIJAgm0GBAw==",
          lpaRspCapability: "gSCAwAAgMCAA"
        });

      expect(response.headers['x-admin-protocol']).toBe('gsma/rsp/v3.0.0');
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.status).toBe(200);
    });

    it('should return HTTP 400 with a structured JSON if the payload has malformed JSON', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/initiateAuthentication')
        .set('Content-Type', 'application/json')
        .send('{ invalidJson: true, }');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Malformed JSON Payload"
      });
    });

    it('should return HTTP 400 if the request fails schema validations (Zod)', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/initiateAuthentication')
        .send({
          smdpAddress: "rsp.unuko.io"
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid Request Payload");
      expect(response.body.details).toBeDefined();
    });
  });

  describe('ES9+ Interface (LPA / Device <-> SM-DP+)', () => {
    it('should process /es9plus/initiateAuthentication correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/initiateAuthentication')
        .send({
          euiccChallenge: "V0FMVF9CT1JERVJfQ09MTElF",
          smdpAddress: "rsp.unuko.io",
          euiccInfo1: "pyGBIKAgv0GBIJAgm0GBAw==",
          lpaRspCapability: "gSCAwAAgMCAA"
        });

      expect(response.status).toBe(200);
      expect(response.body.transactionId).toBe(MOCK_DATA.TRANSACTION_ID);
      expect(response.body.serverSigned1).toBeDefined();
    });

    it('should process /es9plus/authenticateClient correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/authenticateClient')
        .send({
          transactionId: "tx-2026-smdp-mock-v2",
          authenticateServerResponse: "V0FMVF9CT1JERVJfQ09MTElF"
        });

      expect(response.status).toBe(200);
      expect(response.body.profileMetadata).toBe(MOCK_DATA.PROFILE_METADATA);
      expect(response.body.smdpSignature2).toBe(MOCK_DATA.SMDP_SIGNATURE_2);
    });

    it('should process /es9plus/getBoundProfilePackage correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/getBoundProfilePackage')
        .send({
          transactionId: "tx-2026-smdp-mock-v2",
          prepareDownloadResponse: "V0FMVF9CT1JERVJfQ09MTElF"
        });

      expect(response.status).toBe(200);
      expect(response.body.boundProfilePackage).toBe(MOCK_DATA.BOUND_PROFILE_PACKAGE);
    });

    it('should process /es9plus/cancelSession correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/cancelSession')
        .send({
          transactionId: "tx-2026-smdp-mock-v2",
          cancelSessionResponse: "V0FMVF9CT1JERVJfQ09MTElF"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });

    it('should process /es9plus/handleNotification correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/handleNotification')
        .send({
          pendingNotification: "V0FMVF9CT1JERVJfQ09MTElF"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });

    it('should process /es9plus/confirmDeviceChange correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es9plus/confirmDeviceChange')
        .send({
          transactionId: "tx-dev-change-2026",
          deviceChangeResponse: "V0FMVF9CT1JERVJfQ09MTElF"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });
  });

  describe('ES2+ Interface (MNO Operator / BSS <-> SM-DP+)', () => {
    it('should process /es2plus/downloadOrder correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es2plus/downloadOrder')
        .send({
          eid: "89049032000001234567890123456789",
          profileType: "B2B_GENERIC"
        });

      expect(response.status).toBe(200);
      expect(response.body.iccid).toBe("89049032000001234567");
    });

    it('should process /es2plus/confirmOrder correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es2plus/confirmOrder')
        .send({
          iccid: "89049032000001234567",
          eid: "89049032000001234567890123456789"
        });

      expect(response.status).toBe(200);
      expect(response.body.matchingId).toBe("MATCHING-89049032000001234567-UNUKO-2026");
    });

    it('should process /es2plus/cancelOrder correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es2plus/cancelOrder')
        .send({
          iccid: "89049032000001234567",
          cancelReason: "mnoInitiated"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });

    it('should process /es2plus/releaseProfile correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es2plus/releaseProfile')
        .send({
          iccid: "89049032000001234567"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });

    it('should process /es2plus/handleDeviceChangeRequest correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es2plus/handleDeviceChangeRequest')
        .send({
          iccid: "89049032000001234567",
          targetEid: "89049032000001234567890123456789",
          deviceChangeId: "dev-change-uuid-2026"
        });

      expect(response.status).toBe(200);
      expect(response.body.deviceChangeAuthorized).toBe(true);
    });

    it('should process /es2plus/provideEID correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es2plus/provideEID')
        .send({
          iccid: "89049032000001234567",
          eid: "89049032000001234567890123456789"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });

    it('should process /es2plus/cancelSession correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es2plus/cancelSession')
        .send({
          transactionId: "tx-777",
          iccid: "89049032000001234567",
          reason: "MNO Intervention"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });
  });

  describe('ES12 Interface (SM-DP+ <-> SM-DS Discovery Server)', () => {
    it('should register a provisioning event in the SM-DS (registerEvent)', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es12/registerEvent')
        .send({
          eid: "89049032000001234567890123456789",
          smdpAddress: "rsp.unuko.io"
        });

      expect(response.status).toBe(200);
      expect(response.body.eventId).toBeDefined();
    });

    it('should delete an event registered in the SM-DS (deleteEvent)', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es12/deleteEvent')
        .send({
          eventId: "event-ds-777",
          deletionReason: "resolved"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });
  });

  describe('ES21 Interface (Enterprise Profile Proxy <-> SM-DP+)', () => {
    it('should process /es21/loadBoundProfilePackage correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp2/es21/loadBoundProfilePackage')
        .send({
          transactionId: "tx-corp-999",
          boundProfilePackage: "V0FMVF9CT1JERVJfQ09MTElF"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });
  });

});