import { Router } from 'express';

// --- ESipa Interfaces (IoT Device / IPA Component) ---
import { initiateAuthenticationIot } from './endpoints/esipa/initiateAuthentication';
import { authenticateClientIot } from './endpoints/esipa/authenticateClient';
import { getBoundProfilePackageIot } from './endpoints/esipa/getBoundProfilePackage';
import { handleNotificationIot } from './endpoints/esipa/handleNotification';

// --- Interfaces ESeim (eSIM IoT Manager / Automatic Orchestrator) ---
import { eimTriggerDownload } from './endpoints/eseim/eimTriggerDownload';
import { cancelSessionEim } from './endpoints/eseim/cancelSession';

const sgp32Router: Router = Router();

/**
 * ============================================================================
 * ESipa Interface : IPA Component of the Device <-> IoT SM-DP+
 * ============================================================================
 */
sgp32Router.post('/esipa/initiateAuthentication', initiateAuthenticationIot);
sgp32Router.post('/esipa/authenticateClient', authenticateClientIot);
sgp32Router.post('/esipa/getBoundProfilePackage', getBoundProfilePackageIot);
sgp32Router.post('/esipa/handleNotification', handleNotificationIot);

/**
 * ============================================================================
 * INTERFAZ ESeim : eSIM IoT Manager (eIM) <-> SM-DP+ de IoT
 * ============================================================================
 */
sgp32Router.post('/eseim/eimTriggerDownload', eimTriggerDownload);
sgp32Router.post('/eseim/cancelSession', cancelSessionEim);

export default sgp32Router;