import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  SERVER: {
    PORT: 3000,
    HOST: '0.0.0.0',
  },
  PATHS: {
    DATA_DIR: './data',
    ENVIRONMENT_FILE: './data/environment.json',
    MOCK_PERSISTENCE_DIR: './data/mock',
    LIMA_PERSISTENCE_DIR: './data/lima',
    MOCK_FILE_AUDIT_DIR: './data/mock',
    LIMA_FILE_AUDIT_DIR: './data/lima',
    SUBSCRIBERS_SEED: path.resolve(__dirname, '../../../../config/seeds/subscribers.json'),
    GNBS_SEED: path.resolve(__dirname, '../../../../config/seeds/gnbs.json'),
    UES_SEED: path.resolve(__dirname, '../../../../config/seeds/ues.json'),
  },
  HARDWARE: {
    UERANSIM_IP: '127.0.0.1',
    UERANSIM_PORT: 37412,
    UERANSIM_INSTANCE: 'core5g',
    OPEN5GS_INSTANCE: 'core5g',
  },
  CRYPTO: {
    SOFTHSM_LIB_PATH: '/opt/homebrew/lib/softhsm/libsofthsm2.so',
    PIN: '1234',
    SLOT: 0,
  },
  WEBHOOK: {
    ALERT_URL: 'http://localhost:3000/v1/orchestrator/alerts/null',
  },
  SERVICES: {
    ALLOWED_SYSTEMD: [
      'open5gs-amfd',
      'open5gs-smfd',
      'open5gs-upfd',
      'open5gs-udmd',
      'open5gs-udrd',
      'open5gs-ausfd',
      'open5gs-nrfd',
      'open5gs-pcfd',
      'open5gs-nssfd',
      'open5gs-bsfd',
    ],
    CORE_TOPOLOGY: [
      { name: 'open5gs-amfd', label: 'AMF', desc: 'Access and Mobility Management Function', ip: '127.0.0.5', port: 38412 },
      { name: 'open5gs-smfd', label: 'SMF', desc: 'Session Management Function', ip: '127.0.0.4', port: 80 },
      { name: 'open5gs-upfd', label: 'UPF', desc: 'User Plane Function', ip: '127.0.0.7', port: 2152 },
      { name: 'open5gs-udmd', label: 'UDM', desc: 'Unified Data Management', ip: '127.0.0.12', port: 80 },
      { name: 'open5gs-udrd', label: 'UDR', desc: 'Unified Data Repository', ip: '127.0.0.20', port: 80 },
      { name: 'open5gs-ausfd', label: 'AUSF', desc: 'Authentication Server Function', ip: '127.0.0.11', port: 80 },
      { name: 'open5gs-nrfd', label: 'NRF', desc: 'Network Repository Function', ip: '127.0.0.10', port: 80 },
      { name: 'open5gs-pcfd', label: 'PCF', desc: 'Policy Control Function', ip: '127.0.0.13', port: 80 },
      { name: 'open5gs-nssfd', label: 'NSSF', desc: 'Network Slice Selection Function', ip: '127.0.0.14', port: 80 },
      { name: 'open5gs-bsfd', label: 'BSF', desc: 'Binding Support Function', ip: '127.0.0.15', port: 80 },
    ],
  },
};
