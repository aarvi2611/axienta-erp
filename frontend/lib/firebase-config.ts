const publicFirebaseEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || '',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || '',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || '',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || '',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
  NEXT_PUBLIC_FIREBASE_APP_ID:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || '',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || ''
};

const missingPublicEnvKeys = Object.entries(publicFirebaseEnv)
  .filter(([key]) => key !== 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID')
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const missingPublicFirebaseEnvKeys = missingPublicEnvKeys;
export const hasPublicFirebaseConfig = missingPublicEnvKeys.length === 0;

const fallbackProjectId = 'axienta-build-placeholder';

export const firebaseConfig = {
  apiKey:
    publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyD0000000000000000000000000000000000',
  authDomain:
    publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    `${fallbackProjectId}.firebaseapp.com`,
  projectId:
    publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackProjectId,
  storageBucket:
    publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    `${fallbackProjectId}.appspot.com`,
  messagingSenderId:
    publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    '000000000000',
  appId:
    publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:000000000000:web:0000000000000000000000',
  measurementId: publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const firebaseProjectId = firebaseConfig.projectId;
export const firebaseStorageBucket = firebaseConfig.storageBucket;
export const firebaseConfigFingerprint = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId
].join('|');

export function assertPublicFirebaseConfig() {
  if (missingPublicEnvKeys.length) {
    throw new Error(
      `Missing Firebase public env vars: ${missingPublicEnvKeys.join(', ')}`
    );
  }
}
