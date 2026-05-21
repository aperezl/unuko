import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app, { server } from './server';
import { MOCK_SGP32_DATA } from './sgp32/constants';

describe('smdp-mockv2 - End-to-End IoT Integration Tests (SGP.32)', () => {

  afterAll(() => {
    if (server && typeof server.close === 'function') {
      server.close();
    }
  });

  describe('Aspects of Orchestration and Global Headers', () => {
    it('should inject the v1.2.0 IoT header on routes under the /gsma/rsp3 prefix', async () => {
      const response = await request(app)
        .post('/gsma/rsp3/eseim/eimTriggerDownload')
        .send({
          eid: "89049032000001234567890123456789",
          eimId: "eim-root-server-global-01",
          autoActivationRequired: true
        });

      expect(response.headers['x-admin-protocol']).toBe('gsma/rsp/v1.2.0');
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.status).toBe(200);
      expect(response.body.transactionId).toBe(MOCK_SGP32_DATA.TRANSACTION_ID);
    });

    it('should reject requests with HTTP 400 if validation fails', async () => {
      const response = await request(app)
        .post('/gsma/rsp3/eseim/eimTriggerDownload')
        .send({
          eid: "89049032_SHORT_BAD_ID",
          eimId: "eim-root-server-global-01"
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Invalid Request Payload");
    });
  });

  describe('ESipa Interface (Device/IPA <-> SM-DP+ IoT)', () => {
    it('should process /esipa/initiateAuthentication correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp3/esipa/initiateAuthentication')
        .send({
          euiccChallenge: "SU9UX0JPUkRFUl9DT0xMSUVfMjAyNg==",
          smdpAddress: "iot-rsp.unuko.io",
          euiccInfo1: "pyGBIKAgv0GBIJAgm0GBAw==",
          cryptoCapability: "gSCAwAAgMCAA"
        });

      expect(response.status).toBe(200);
      expect(response.body.transactionId).toBe(MOCK_SGP32_DATA.TRANSACTION_ID);
      expect(response.body.serverSignature1).toBe(MOCK_SGP32_DATA.SERVER_SIGNATURE_1);
      expect(response.body.serverCertificate).toBe(MOCK_SGP32_DATA.SERVER_CERTIFICATE);
    });

    it('should process /esipa/authenticateClient correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp3/esipa/authenticateClient')
        .send({
          transactionId: "tx-iot-2026-unuko-v12",
          authenticateServerResponse: "Ym9yZGVyY29sbGllLXdhbHQtaW90LWF1dGg="
        });

      expect(response.status).toBe(200);
      expect(response.body.transactionId).toBe("tx-iot-2026-unuko-v12");
      expect(response.body.smdpSignature2).toBe(MOCK_SGP32_DATA.SERVER_SIGNATURE_1);
    });

    it('should process /esipa/getBoundProfilePackage correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp3/esipa/getBoundProfilePackage')
        .send({
          transactionId: "tx-iot-2026-unuko-v12",
          prepareDownloadResponse: "Ym9yZGVyY29sbGllLWlvdC1wcmVwYXJlLWRvd25sb2Fk"
        });

      expect(response.status).toBe(200);
      expect(response.body.boundProfilePackage).toBe(MOCK_SGP32_DATA.BOUND_PROFILE_PACKAGE_IOT);
    });

    it('should process /esipa/handleNotification correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp3/esipa/handleNotification')
        .send({
          pendingNotification: "Ym9yZGVyY29sbGllLWlvdC1pbnN0YWxsLXN1Y2Nlc3M="
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });
  });

  describe('ESEim Interface (eIM <-> SM-DP+ IoT)', () => {
    it('should process /eseim/eimTriggerDownload correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp3/eseim/eimTriggerDownload')
        .send({
          eid: "89049032000001234567890123456789",
          eimId: "eim-root-server-global-01",
          autoActivationRequired: true
        });

      expect(response.status).toBe(200);
      expect(response.body.transactionId).toBe(MOCK_SGP32_DATA.TRANSACTION_ID);
      expect(response.body.iccid).toBe("89049032000009999999");
    });

    it('should process /eseim/cancelSession correctly', async () => {
      const response = await request(app)
        .post('/gsma/rsp3/eseim/cancelSession')
        .send({
          transactionId: "tx-iot-2026-unuko-v12",
          eimId: "eim-root-server-global-01",
          cancelReason: "eimTimeout"
        });

      expect(response.status).toBe(200);
      expect(response.body.header.functionExecutionStatus.status).toBe("Executed-Success");
    });
  });

});