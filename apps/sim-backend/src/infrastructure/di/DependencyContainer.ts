import fs from 'fs';
import { CONFIG } from '../../config/config.js';
import {
  ConsoleAuditAdapter,
  JsonPersistenceAdapter,
  FileAuditAdapter,
  CompositeAuditAdapter,
  SessionInspector,
  MockNetworkAdapter,
} from '@unuko/core';
import { UeransimAdapter, UeransimNetworkAdapter, UeransimHardwareAdapter } from '@unuko/adapter-ueransim';
import { Open5gsSdmAdapter } from '@unuko/adapter-open5gs-sdm';
import { PKCS11Adapter } from '@unuko/adapter-pkcs11';
import { HttpmTLSAdapter, WebhookNotificationAdapter } from '@unuko/adapter-http';
import { MockSdmAdapter, MockUeransimNetworkAdapter } from '../../adapters/MockInfrastructureAdapter.js';

export class DependencyContainer {
  private currentEnvironment: 'mock' | 'lima' = 'mock';
  private activeVmName: string = 'core5g';

  // Core adapters
  private rawHardware!: UeransimHardwareAdapter;
  private crypto!: PKCS11Adapter;
  private rawTransport!: HttpmTLSAdapter;
  private notification!: WebhookNotificationAdapter;

  // Environment-specific adapters
  private mockPersistence!: JsonPersistenceAdapter;
  private mockFileAudit!: FileAuditAdapter;
  private mockAudit!: CompositeAuditAdapter;
  private mockInspector!: SessionInspector;

  private limaPersistence!: JsonPersistenceAdapter;
  private limaFileAudit!: FileAuditAdapter;
  private limaAudit!: CompositeAuditAdapter;
  private limaInspector!: SessionInspector;

  private ueransimNetwork!: UeransimNetworkAdapter;
  private sdmAdapter!: Open5gsSdmAdapter;
  private mockUeransimNetwork!: MockUeransimNetworkAdapter;
  private mockSdmAdapter!: MockSdmAdapter;
  private mockNetwork!: MockNetworkAdapter;

  constructor() {
    this.init();
  }

  private init() {
    // 1. Ensure data directories exist
    if (!fs.existsSync(CONFIG.PATHS.DATA_DIR)) {
      fs.mkdirSync(CONFIG.PATHS.DATA_DIR, { recursive: true });
    }

    // 2. Load environment configuration
    try {
      if (fs.existsSync(CONFIG.PATHS.ENVIRONMENT_FILE)) {
        const envData = fs.readFileSync(CONFIG.PATHS.ENVIRONMENT_FILE, 'utf-8');
        const parsed = JSON.parse(envData);
        this.currentEnvironment = parsed.environment || 'mock';
        this.activeVmName = parsed.activeVm || 'core5g';
      }
    } catch (e) {
      console.error('[DI]: Failed to load environment configuration, falling back to mock:', e);
    }

    // 3. Instantiate base/shared adapters
    const consoleAudit = new ConsoleAuditAdapter();

    this.mockPersistence = new JsonPersistenceAdapter(CONFIG.PATHS.MOCK_PERSISTENCE_DIR);
    this.mockFileAudit = new FileAuditAdapter(CONFIG.PATHS.MOCK_FILE_AUDIT_DIR);
    this.mockAudit = new CompositeAuditAdapter([this.mockFileAudit, consoleAudit]);
    this.mockInspector = new SessionInspector(this.mockPersistence, this.mockFileAudit);

    this.limaPersistence = new JsonPersistenceAdapter(CONFIG.PATHS.LIMA_PERSISTENCE_DIR);
    this.limaFileAudit = new FileAuditAdapter(CONFIG.PATHS.LIMA_FILE_AUDIT_DIR);
    this.limaAudit = new CompositeAuditAdapter([this.limaFileAudit, consoleAudit]);
    this.limaInspector = new SessionInspector(this.limaPersistence, this.limaFileAudit);

    this.rawHardware = new UeransimAdapter(CONFIG.HARDWARE.UERANSIM_IP, CONFIG.HARDWARE.UERANSIM_PORT);
    this.crypto = new PKCS11Adapter(
      CONFIG.CRYPTO.SOFTHSM_LIB_PATH,
      CONFIG.CRYPTO.PIN,
      CONFIG.CRYPTO.SLOT
    );
    this.rawTransport = new HttpmTLSAdapter(this.crypto);
    this.notification = new WebhookNotificationAdapter(CONFIG.WEBHOOK.ALERT_URL);
    
    this.ueransimNetwork = new UeransimNetworkAdapter(this.activeVmName);
    this.sdmAdapter = new Open5gsSdmAdapter(this.activeVmName);
    this.mockUeransimNetwork = new MockUeransimNetworkAdapter();
    this.mockSdmAdapter = new MockSdmAdapter();
    this.mockNetwork = new MockNetworkAdapter({ delayMs: 1000 });
  }

  // Getters
  getEnvironment(): 'mock' | 'lima' {
    return this.currentEnvironment;
  }

  setEnvironment(env: 'mock' | 'lima') {
    this.currentEnvironment = env;
    try {
      fs.writeFileSync(
        CONFIG.PATHS.ENVIRONMENT_FILE,
        JSON.stringify({ environment: env, activeVm: this.activeVmName }, null, 2)
      );
    } catch (e) {
      console.error('[DI]: Failed to write environment config file:', e);
    }
  }

  getActiveVm(): string {
    return this.activeVmName;
  }

  setActiveVm(vmName: string) {
    this.activeVmName = vmName;
    this.ueransimNetwork = new UeransimNetworkAdapter(vmName);
    this.sdmAdapter = new Open5gsSdmAdapter(vmName);
    try {
      fs.writeFileSync(
        CONFIG.PATHS.ENVIRONMENT_FILE,
        JSON.stringify({ environment: this.currentEnvironment, activeVm: vmName }, null, 2)
      );
      console.log(`[DI]: Updated active VM to: ${vmName}`);
    } catch (e) {
      console.error('[DI]: Failed to write environment config file:', e);
    }
  }

  getActiveSdm() {
    return this.currentEnvironment === 'lima' ? this.sdmAdapter : this.mockSdmAdapter;
  }

  getActiveUeransim() {
    return this.currentEnvironment === 'lima' ? this.ueransimNetwork : this.mockUeransimNetwork;
  }

  getActivePersistence() {
    return this.currentEnvironment === 'lima' ? this.limaPersistence : this.mockPersistence;
  }

  getActiveFileAudit() {
    return this.currentEnvironment === 'lima' ? this.limaFileAudit : this.mockFileAudit;
  }

  getActiveAudit() {
    return this.currentEnvironment === 'lima' ? this.limaAudit : this.mockAudit;
  }

  getActiveInspector() {
    return this.currentEnvironment === 'lima' ? this.limaInspector : this.mockInspector;
  }

  getRawHardware() {
    return this.rawHardware;
  }

  getCrypto() {
    return this.crypto;
  }

  getRawTransport() {
    return this.rawTransport;
  }

  getNotification() {
    return this.notification;
  }

  getMockNetwork() {
    return this.mockNetwork;
  }

  getActiveNetwork() {
    return this.currentEnvironment === 'lima' ? this.ueransimNetwork : this.mockNetwork;
  }
}

export const container = new DependencyContainer();
