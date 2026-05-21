import { NextFunction, Request, Response } from 'express'; import { auth, db } from '../config/firebaseAdmin';
export type Role = 'CEO'|'Admin'|'Head Manager'|'Team Manager'|'Sales Executive'|'Calling Executive'|'Data Scraper'|'Operations Team'|'HR';
declare global { namespace Express { interface Request { user?: { uid:string; email?:string; role:Role; employeeId?:string; }; } } }

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
      hint: 'Make sure frontend NEXT_PUBLIC_FIREBASE_PROJECT_ID and backend FIREBASE_PROJECT_ID/service account use the same Firebase project, then restart both servers.'
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
      hint: 'Create a new Firebase Admin service-account key, update backend/.env, and restart the backend.'
    };
  }

  if (code === 'auth/argument-error' || lowered.includes('jwt')) {
    return {
      message: 'Firebase token could not be verified by the backend.',
      code: code || 'auth/token-verification-failed',
      hint: 'Sign out, refresh the app, sign in again, and make sure the backend was restarted after env changes.'
    };
  }

  return {
    message: 'Invalid or expired token',
    code: code || 'auth/unknown',
    hint: 'Sign out, refresh the app, sign in again, and restart the backend if you changed backend/.env.'
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) { const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim(); if (!token) return res.status(401).json({ error: 'Missing bearer token' }); try { const decoded = await auth.verifyIdToken(token); let snap = await db.collection('users').doc(decoded.uid).get(); if (!snap.exists) { console.log(`Creating profile for new user: ${decoded.uid} (${decoded.email})`); const newProfile = { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email?.split('@')[0] || 'User', role: 'Sales Executive' as Role, department: 'General', status: 'active', createdAt: new Date().toISOString() }; await db.collection('users').doc(decoded.uid).set(newProfile); snap = await db.collection('users').doc(decoded.uid).get(); } const profile = snap.data() as any; req.user = { uid: decoded.uid, email: decoded.email, role: profile.role, employeeId: profile.employeeId }; next(); } catch (e: any) { const authError = readAuthError(e); console.error('Auth error:', { code: authError.code, message: e?.message }); res.status(401).json({ error: authError.message, code: authError.code, hint: authError.hint }); } }
export const allowRoles = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });
