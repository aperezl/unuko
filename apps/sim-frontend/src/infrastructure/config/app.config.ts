export const APP_CONFIG = {
  API_BASE_URL: '',
  ENDPOINTS: {
    ENVIRONMENT: '/v1/orchestrator/environment',
    SESSIONS: '/v1/orchestrator/sessions',
    SESSION: '/v1/orchestrator/session',
    SESSION_DETAIL: (id: string) => `/v1/orchestrator/session/${id}`,
    SERVICES_STATUS: '/v1/orchestrator/services/status',
    SERVICES_STATE: (name: string) => `/v1/orchestrator/services/${name}/state`,
    DEVICES: '/v1/infrastructure/devices',
    PROVISION_ALL: '/v1/infrastructure/provision-all',
    UE_PROVISION: '/v1/infrastructure/ue',
    UE_PROVISION_DETAIL: (imsi: string) => `/v1/infrastructure/ue/${imsi}`,
    GNB_PROVISION: '/v1/infrastructure/gnb',
    GNB_PROVISION_DETAIL: (nci: string) => `/v1/infrastructure/gnb/${nci}`,
    DEVICE_DETAIL: (id: string) => `/v1/infrastructure/device/${id}`,
    DEVICE_START: (id: string) => `/v1/infrastructure/device/${id}/start`,
    DEVICE_STOP: (id: string) => `/v1/infrastructure/device/${id}/stop`,
    DEVICE_LOGS: (id: string) => `/v1/infrastructure/device/${id}/logs`,
    DEVICE_CONFIG: (id: string) => `/v1/infrastructure/device/${id}/config`,
    SUBSCRIBERS: '/v1/inventory/subscribers',
    SUBSCRIBER_DETAIL: (imsi: string) => `/v1/inventory/subscribers/${imsi}`,
  }
};
