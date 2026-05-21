import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { assertPublicFirebaseConfig, firebaseConfig } from './firebase-config';

function initClientApp() {
  if (typeof window !== 'undefined') {
    assertPublicFirebaseConfig();
  }

  const existingApp = getApps()[0];

  if (existingApp) {
    const existingProjectId = existingApp.options.projectId;

    if (
      existingProjectId &&
      existingProjectId !== firebaseConfig.projectId
    ) {
      throw new Error(
        `Firebase app project mismatch: loaded ${existingProjectId}, expected ${firebaseConfig.projectId}. Restart the app after updating env vars.`
      );
    }

    return existingApp;
  }

  return initializeApp(firebaseConfig);
}

export const app = initClientApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const initAnalytics = async () =>
  typeof window !== 'undefined' && (await isSupported())
    ? getAnalytics(app)
    : null;
