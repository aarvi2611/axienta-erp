import admin from 'firebase-admin';

type RawServiceAccount = admin.ServiceAccount & {
  client_email?: string;
  private_key?: string;
  project_id?: string;
};

function parseServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();

  if (b64) {
    try {
      return JSON.parse(
        Buffer.from(b64, 'base64').toString('utf8')
      ) as RawServiceAccount;
    } catch (error) {
      throw new Error(
        `Invalid FIREBASE_SERVICE_ACCOUNT_BASE64 value: ${
          error instanceof Error ? error.message : 'Unable to decode service account'
        }`
      );
    }
  }

  if (json) {
    try {
      return JSON.parse(json) as RawServiceAccount;
    } catch (error) {
      throw new Error(
        `Invalid FIREBASE_SERVICE_ACCOUNT_JSON value: ${
          error instanceof Error ? error.message : 'Unable to parse service account'
        }`
      );
    }
  }

  return null;
}

function resolveFirebaseAdminSettings() {
  const serviceAccount = parseServiceAccount();
  const envProjectId = process.env.FIREBASE_PROJECT_ID?.trim() || '';
  const envStorageBucket = process.env.FIREBASE_STORAGE_BUCKET?.trim() || '';
  const serviceAccountProjectId =
    serviceAccount?.project_id?.trim() ||
    serviceAccount?.projectId?.trim() ||
    '';
  const projectId = envProjectId || serviceAccountProjectId;

  if (!projectId) {
    throw new Error(
      'Missing FIREBASE_PROJECT_ID or service account project_id.'
    );
  }

  if (envProjectId && serviceAccountProjectId && envProjectId !== serviceAccountProjectId) {
    throw new Error(
      `Firebase admin project mismatch: FIREBASE_PROJECT_ID is ${envProjectId} but the service account belongs to ${serviceAccountProjectId}.`
    );
  }

  return {
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
    projectId,
    storageBucket:
      envStorageBucket || `${projectId}.firebasestorage.app`
  };
}

export function initFirebaseAdmin() {
  const settings = resolveFirebaseAdminSettings();

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: settings.credential,
      projectId: settings.projectId,
      storageBucket: settings.storageBucket
    });
  } else if (
    admin.app().options.projectId &&
    admin.app().options.projectId !== settings.projectId
  ) {
    throw new Error(
      `Firebase admin app already initialized for ${admin.app().options.projectId}; expected ${settings.projectId}. Restart the server after changing env vars.`
    );
  }

  return admin;
}
export const firebaseAdmin = initFirebaseAdmin();
export const db = firebaseAdmin.firestore();
export const auth = firebaseAdmin.auth();
export const bucket = firebaseAdmin.storage().bucket();
