export const initialContext = {
    step: 0,
    transactionId: null,
    segments: [],
    currentSegmentIndex: 0,
    error: null,
    retryCount: 0
};
export const initialInventoryContext = {
    profiles: [],
    error: null,
    retryCount: 0
};
export const initialProfileMgmtContext = {
    iccid: '',
    action: 'enable',
    refreshRequired: false,
    error: null,
    retryCount: 0
};
export const initialNotificationContext = {
    notifications: [],
    currentNotificationIndex: 0,
    error: null,
    retryCount: 0
};
