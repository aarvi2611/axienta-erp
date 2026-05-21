import { signOut } from 'firebase/auth';
import { auth } from './firebase';

const DEMO_PROFILE_STORAGE_KEY = 'Axienta-demo-profile';

const expiredSessionCodes = new Set([
  'auth/id-token-expired',
  'auth/invalid-user-token',
  'auth/user-token-expired',
  'auth/user-token-revoked',
  'auth/user-disabled'
]);

function getAuthErrorMessage(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const message = error instanceof Error ? error.message : '';

  if (expiredSessionCodes.has(code)) {
    return 'Firebase session expired. Please sign in again.';
  }

  if (
    message.includes('incorrect "aud"') ||
    message.includes('incorrect "iss"') ||
    message.toLowerCase().includes('project mismatch')
  ) {
    return 'Firebase project mismatch detected. Update the frontend Firebase config and admin service account to the same project, then sign in again.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Unable to refresh the Firebase session right now. Check your connection and try again.';
  }

  return 'Unable to verify your Firebase session. Please sign in again.';
}

function mergeAuthHeaders(headers: HeadersInit | undefined, token: string) {
  const nextHeaders = new Headers(headers);
  nextHeaders.set('Authorization', `Bearer ${token}`);
  return nextHeaders;
}

async function clearStaleSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY);
  }

  if (auth.currentUser) {
    try {
      await signOut(auth);
    } catch {
      // Keep the original auth error as the primary failure.
    }
  }
}

async function readResponseError(response: Response) {
  try {
    const body = await response.clone().json();
    return typeof body?.error === 'string' ? body.error : '';
  } catch {
    return '';
  }
}

function normalizeServerAuthMessage(message: string) {
  const lowered = message.toLowerCase();

  if (!message) {
    return 'Firebase session expired. Please sign in again.';
  }

  if (
    lowered.includes('incorrect "aud"') ||
    lowered.includes('incorrect "iss"') ||
    lowered.includes('project mismatch')
  ) {
    return 'Firebase project mismatch detected. Update the frontend Firebase config and admin service account to the same project, then sign in again.';
  }

  if (
    lowered.includes('expired token') ||
    lowered.includes('session expired') ||
    lowered.includes('revoked')
  ) {
    return 'Firebase session expired. Please sign in again.';
  }

  return message;
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(
      'Please sign in with a Firebase account first. Demo mode cannot call protected APIs.'
    );
  }

  let token: string;

  try {
    token = await currentUser.getIdToken();
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      expiredSessionCodes.has(String((error as { code?: unknown }).code || ''))
    ) {
      await clearStaleSession();
    }

    throw new Error(getAuthErrorMessage(error));
  }

  let response = await fetch(input, {
    ...init,
    headers: mergeAuthHeaders(init.headers, token)
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    token = await currentUser.getIdToken(true);
  } catch (error) {
    await clearStaleSession();
    throw new Error(getAuthErrorMessage(error));
  }

  response = await fetch(input, {
    ...init,
    headers: mergeAuthHeaders(init.headers, token)
  });

  if (response.status !== 401) {
    return response;
  }

  const responseError = normalizeServerAuthMessage(
    await readResponseError(response)
  );

  await clearStaleSession();
  throw new Error(responseError);
}
