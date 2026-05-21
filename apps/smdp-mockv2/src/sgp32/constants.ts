import { Sgp32ResponseHeader } from './types';

export const MOCK_SGP32_HEADERS: { SUCCESS: Sgp32ResponseHeader } = {
  SUCCESS: {
    functionExecutionStatus: { status: "Executed-Success" }
  }
};

export const MOCK_SGP32_DATA = {
  TRANSACTION_ID: "tx-iot-2026-unuko-v12",
  EIM_ID: "eim-root-server-global-01",
  SERVER_CERTIFICATE: "MIIB7zCCAXagAwIBAgIQ...REAL_MOCK_IOT_SMDP_CERT...",
  SERVER_SIGNED_1: "Ym9yZGVyY29sbGllLXdhbHQtMjAyNi1zbWRwLW1vY2staW90LXYxMg==",
  SERVER_SIGNATURE_1: "MEUCIQDF3iK4m9Z3xP3zL9QkMOCK_IOT_SIGNATURE_DER_BASE64...",
  BOUND_PROFILE_PACKAGE_IOT: "BF3681ED...MOCK_SGP32_BOUND_PROFILE_PACKAGE_BASE64..."
};