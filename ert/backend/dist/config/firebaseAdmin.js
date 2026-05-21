"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = exports.auth = exports.db = exports.firebaseAdmin = void 0;
exports.initFirebaseAdmin = initFirebaseAdmin;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
function parseServiceAccount() {
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    if (b64) {
        try {
            return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
        }
        catch (error) {
            throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_BASE64 value: ${error instanceof Error ? error.message : 'Unable to decode service account'}`);
        }
    }
    if (json) {
        try {
            return JSON.parse(json);
        }
        catch (error) {
            throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_JSON value: ${error instanceof Error ? error.message : 'Unable to parse service account'}`);
        }
    }
    return null;
}
function resolveFirebaseAdminSettings() {
    const serviceAccount = parseServiceAccount();
    const envProjectId = process.env.FIREBASE_PROJECT_ID?.trim() || '';
    const envStorageBucket = process.env.FIREBASE_STORAGE_BUCKET?.trim() || '';
    const serviceAccountProjectId = serviceAccount?.project_id?.trim() ||
        serviceAccount?.projectId?.trim() ||
        '';
    const projectId = envProjectId || serviceAccountProjectId;
    if (!projectId) {
        throw new Error('Missing FIREBASE_PROJECT_ID or service account project_id.');
    }
    if (envProjectId && serviceAccountProjectId && envProjectId !== serviceAccountProjectId) {
        throw new Error(`Firebase admin project mismatch: FIREBASE_PROJECT_ID is ${envProjectId} but the service account belongs to ${serviceAccountProjectId}.`);
    }
    return {
        credential: serviceAccount
            ? firebase_admin_1.default.credential.cert(serviceAccount)
            : firebase_admin_1.default.credential.applicationDefault(),
        projectId,
        storageBucket: envStorageBucket || `${projectId}.firebasestorage.app`
    };
}
function initFirebaseAdmin() {
    const settings = resolveFirebaseAdminSettings();
    if (!firebase_admin_1.default.apps.length) {
        firebase_admin_1.default.initializeApp({
            credential: settings.credential,
            projectId: settings.projectId,
            storageBucket: settings.storageBucket
        });
    }
    else if (firebase_admin_1.default.app().options.projectId &&
        firebase_admin_1.default.app().options.projectId !== settings.projectId) {
        throw new Error(`Firebase admin app already initialized for ${firebase_admin_1.default.app().options.projectId}; expected ${settings.projectId}. Restart the server after changing env vars.`);
    }
    return firebase_admin_1.default;
}
exports.firebaseAdmin = initFirebaseAdmin();
exports.db = exports.firebaseAdmin.firestore();
exports.auth = exports.firebaseAdmin.auth();
exports.bucket = exports.firebaseAdmin.storage().bucket();
