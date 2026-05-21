import { NextFunction, Request, Response } from 'express'; import { auth, db } from '../config/firebaseAdmin';
export type Role = 'CEO'|'Admin'|'Head Manager'|'Team Manager'|'Sales Executive'|'Calling Executive'|'Data Scraper'|'Operations Team'|'HR';
declare global { namespace Express { interface Request { user?: { uid:string; email?:string; role:Role; employeeId?:string; }; } } }

function getAuthErrorMessage(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const message = error instanceof Error ? error.message : '';

  if (code === 'auth/id-token-expired' || code === 'auth/user-token-expired') {
    return 'Firebase session expired. Please sign in again.';
  }

  if (code === 'auth/id-token-revoked') {
    return 'Firebase session was revoked. Please sign in again.';
  }

  if (
    message.includes('incorrect "aud"') ||
    message.includes('incorrect "iss"') ||
    message.toLowerCase().includes('project mismatch')
  ) {
    return 'Firebase project mismatch detected between the web app and the admin service account.';
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/insufficient-permission' ||
    code === 'auth/project-not-found'
  ) {
    return 'Firebase admin credentials are misconfigured for this project.';
  }

  return 'Invalid or expired token';
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) { const token = (req.headers.authorization || '').replace('Bearer ', ''); if (!token) return res.status(401).json({ error: 'Missing bearer token' }); try { const decoded = await auth.verifyIdToken(token); let snap = await db.collection('users').doc(decoded.uid).get(); if (!snap.exists) { console.log(`Creating profile for new user: ${decoded.uid} (${decoded.email})`); const newProfile = { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email?.split('@')[0] || 'User', role: 'Sales Executive' as Role, department: 'General', status: 'active', createdAt: new Date().toISOString() }; await db.collection('users').doc(decoded.uid).set(newProfile); snap = await db.collection('users').doc(decoded.uid).get(); } const profile = snap.data() as any; req.user = { uid: decoded.uid, email: decoded.email, role: profile.role, employeeId: profile.employeeId }; next(); } catch (e: any) { console.error('Auth error:', e.code || e.message); res.status(401).json({ error: getAuthErrorMessage(e) }); } }
export const allowRoles = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });
