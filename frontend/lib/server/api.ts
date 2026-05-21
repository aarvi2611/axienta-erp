import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { Role, UserProfile } from '@/types';
import { getAdminAuth, getAdminDb } from './firebase-admin';

export type ApiUser = {
  uid: string;
  email?: string;
  name?: string;
  role: Role;
  employeeId?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  hint?: string;

  constructor(status: number, message: string, code?: string, hint?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.hint = hint;
  }
}

function readAuthError(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const message = error instanceof Error ? error.message : '';
  const lowered = message.toLowerCase();

  if (code === 'auth/id-token-expired' || code === 'auth/user-token-expired') {
    return {
      message: 'Firebase session expired. Please sign in again.',
      code,
      hint: 'Refresh the page, then log in again.'
    };
  }

  if (code === 'auth/id-token-revoked') {
    return {
      message: 'Firebase session was revoked. Please sign in again.',
      code,
      hint: 'Log in again after the Firebase user/session change.'
    };
  }

  if (
    message.includes('incorrect "aud"') ||
    message.includes('incorrect "iss"') ||
    lowered.includes('project mismatch')
  ) {
    return {
      message: 'Firebase project mismatch detected between the web app and the backend.',
      code: code || 'auth/project-mismatch',
      hint: 'Make sure frontend NEXT_PUBLIC_FIREBASE_PROJECT_ID and backend FIREBASE_PROJECT_ID/service account use the same Firebase project, then redeploy/restart.'
    };
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/insufficient-permission' ||
    code === 'auth/project-not-found'
  ) {
    return {
      message: 'Firebase admin credentials are misconfigured for this project.',
      code,
      hint: 'Create a new Firebase Admin service-account key, update the server env vars, and redeploy/restart.'
    };
  }

  if (code === 'auth/argument-error' || lowered.includes('jwt')) {
    return {
      message: 'Firebase token could not be verified by the backend.',
      code: code || 'auth/token-verification-failed',
      hint: 'Sign out, refresh the app, sign in again, and make sure the server was restarted after env changes.'
    };
  }

  return {
    message: 'Invalid or expired token',
    code: code || 'auth/unknown',
    hint: 'Sign out, refresh the app, sign in again, and redeploy/restart the server if env vars changed.'
  };
}

export async function requireApiUser(request: NextRequest): Promise<ApiUser> {
  const token = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')
    .trim();

  if (!token) {
    throw new ApiError(401, 'Missing bearer token');
  }

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const decoded = await adminAuth.verifyIdToken(token);
    const userRef = adminDb.collection('users').doc(decoded.uid);
    let snapshot = await userRef.get();

    if (!snapshot.exists) {
      const defaultProfile: UserProfile = {
        uid: decoded.uid,
        employeeId: '',
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
        email: decoded.email || '',
        role: 'Sales Executive',
        department: 'General',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      await userRef.set(defaultProfile);
      snapshot = await userRef.get();
    }

    const profile = (snapshot.data() || {}) as Partial<UserProfile>;

    return {
      uid: decoded.uid,
      email: decoded.email,
      name: profile.name || decoded.name || decoded.email?.split('@')[0] || 'User',
      role: (profile.role as Role) || 'Sales Executive',
      employeeId: profile.employeeId
    };
  } catch (error) {
    const authError = readAuthError(error);
    console.error('API auth error:', {
      code: authError.code,
      message: error instanceof Error ? error.message : 'Unknown auth error'
    });
    throw new ApiError(401, authError.message, authError.code, authError.hint);
  }
}

export function assertRole(user: ApiUser, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, 'Insufficient permissions');
  }
}

export async function writeAuditLog(
  request: NextRequest,
  user: ApiUser,
  action: string,
  details: Record<string, unknown> = {}
) {
  const adminDb = getAdminDb();
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '';

  await adminDb.collection('activity_logs').add({
    action,
    userId: user.uid,
    role: user.role,
    method: request.method,
    path: new URL(request.url).pathname,
    at: new Date().toISOString(),
    ip,
    ...details
  });
}

function getFirebaseErrorStatus(code: string) {
  switch (code) {
    case 'auth/email-already-exists':
      return 409;
    case 'auth/user-not-found':
      return 404;
    case 'auth/invalid-password':
      return 400;
    default:
      return 500;
  }
}

export function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code, hint: error.hint },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    const message =
      error.issues[0]?.message || 'Request payload validation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: unknown }).code || '');
    const message =
      error instanceof Error ? error.message : 'Firebase request failed';

    return NextResponse.json(
      { error: message },
      { status: getFirebaseErrorStatus(code) }
    );
  }

  const message =
    error instanceof Error ? error.message : 'Internal server error';

  return NextResponse.json({ error: message }, { status: 500 });
}
