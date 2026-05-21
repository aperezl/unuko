import { Router } from 'express';

// --- Interfaces ES9+ (LPA / Device) ---
import { initiateAuthentication } from './endpoints/es9plus/initiateAuthentication';
import { authenticateClient } from './endpoints/es9plus/authenticateClient';
import { getBoundProfilePackage } from './endpoints/es9plus/getBoundProfilePackage';
import { cancelSession } from './endpoints/es9plus/cancelSession';
import { handleNotification } from './endpoints/es9plus/handleNotification';
import { confirmDeviceChange } from './endpoints/es9plus/confirmDeviceChange'; // v3.0

// --- Interfaces ES2+ (MNO / Operator / Internal Panel) ---
import { downloadOrder } from './endpoints/es2plus/downloadOrder';
import { confirmOrder } from './endpoints/es2plus/confirmOrder';
import { cancelOrder } from './endpoints/es2plus/cancelOrder';
import { releaseProfile } from './endpoints/es2plus/releaseProfile';
import { handleDeviceChangeRequest } from './endpoints/es2plus/handleDeviceChangeRequest'; // v3.0
import { provideEID } from './endpoints/es2plus/provideEID';
import { cancelSessionMno } from './endpoints/es2plus/cancelSession';

// --- Interfaces ES12 (SM-DP+ <-> SM-DS Root Discovery Server) ---
import { registerEvent } from './endpoints/es12/registerEvent';
import { deleteEvent } from './endpoints/es12/deleteEvent';

// --- Interfaces ES21 (Enterprise Profile Proxy <-> SM-DP+) ---
import { loadBoundProfilePackage } from './endpoints/es21/loadBoundProfilePackage'; // v3.0

const sgp22Router: Router = Router();

/**
 * ============================================================================
 * INTERFACE ES9+ : Device / LPA <-> SM-DP+
 * ============================================================================
 */
sgp22Router.post('/es9plus/initiateAuthentication', initiateAuthentication);
sgp22Router.post('/es9plus/authenticateClient', authenticateClient);
sgp22Router.post('/es9plus/getBoundProfilePackage', getBoundProfilePackage);
sgp22Router.post('/es9plus/cancelSession', cancelSession);
sgp22Router.post('/es9plus/handleNotification', handleNotification);
sgp22Router.post('/es9plus/confirmDeviceChange', confirmDeviceChange);

/**
 * ============================================================================
 * INTERFACE ES2+ : Operator (MNO / BSS) <-> SM-DP+
 * ============================================================================
 */
sgp22Router.post('/es2plus/downloadOrder', downloadOrder);
sgp22Router.post('/es2plus/confirmOrder', confirmOrder);
sgp22Router.post('/es2plus/cancelOrder', cancelOrder);
sgp22Router.post('/es2plus/releaseProfile', releaseProfile);
sgp22Router.post('/es2plus/handleDeviceChangeRequest', handleDeviceChangeRequest);
sgp22Router.post('/es2plus/provideEID', provideEID);
sgp22Router.post('/es2plus/cancelSession', cancelSessionMno);

/**
 * ============================================================================
 * INTERFACE ES12 : SM-DS Root Discovery Server
 * ============================================================================
 */
sgp22Router.post('/es12/registerEvent', registerEvent);
sgp22Router.post('/es12/deleteEvent', deleteEvent);

/**
 * ============================================================================
 * INTERFACE ES21 : Enterprise Profile Proxy <-> SM-DP+
 * ============================================================================
 */
sgp22Router.post('/es21/loadBoundProfilePackage', loadBoundProfilePackage);

export default sgp22Router;