"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = void 0;
exports.requireAuth = requireAuth;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
function readAuthError(error) {
    const code = error && typeof error === 'object' && 'code' in error
        ? String(error.code || '')
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
    if (message.includes('incorrect "aud"') ||
        message.includes('incorrect "iss"') ||
        lowered.includes('project mismatch')) {
        return {
            message: 'Firebase project mismatch detected between the web app and the backend.',
            code: code || 'auth/project-mismatch',
            hint: 'Make sure frontend NEXT_PUBLIC_FIREBASE_PROJECT_ID and backend FIREBASE_PROJECT_ID/service account use the same Firebase project, then restart both servers.'
        };
    }
    if (code === 'auth/invalid-credential' ||
        code === 'auth/insufficient-permission' ||
        code === 'auth/project-not-found') {
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
async function requireAuth(req, res, next) { const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim(); if (!token)
    return res.status(401).json({ error: 'Missing bearer token' }); try {
    const decoded = await firebaseAdmin_1.auth.verifyIdToken(token);
    let snap = await firebaseAdmin_1.db.collection('users').doc(decoded.uid).get();
    if (!snap.exists) {
        console.log(`Creating profile for new user: ${decoded.uid} (${decoded.email})`);
        const newProfile = { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email?.split('@')[0] || 'User', role: 'Sales Executive', department: 'General', status: 'active', createdAt: new Date().toISOString() };
        await firebaseAdmin_1.db.collection('users').doc(decoded.uid).set(newProfile);
        snap = await firebaseAdmin_1.db.collection('users').doc(decoded.uid).get();
    }
    const profile = snap.data();
    req.user = { uid: decoded.uid, email: decoded.email, role: profile.role, employeeId: profile.employeeId };
    next();
}
catch (e) {
    const authError = readAuthError(e);
    console.error('Auth error:', { code: authError.code, message: e?.message });
    res.status(401).json({ error: authError.message, code: authError.code, hint: authError.hint });
} }
const allowRoles = (...roles) => (req, res, next) => req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });
exports.allowRoles = allowRoles;
