"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowRoles = void 0;
exports.requireAuth = requireAuth;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
function getAuthErrorMessage(error) {
    const code = error && typeof error === 'object' && 'code' in error
        ? String(error.code || '')
        : '';
    const message = error instanceof Error ? error.message : '';
    if (code === 'auth/id-token-expired' || code === 'auth/user-token-expired') {
        return 'Firebase session expired. Please sign in again.';
    }
    if (code === 'auth/id-token-revoked') {
        return 'Firebase session was revoked. Please sign in again.';
    }
    if (message.includes('incorrect "aud"') ||
        message.includes('incorrect "iss"') ||
        message.toLowerCase().includes('project mismatch')) {
        return 'Firebase project mismatch detected between the web app and the admin service account.';
    }
    if (code === 'auth/invalid-credential' ||
        code === 'auth/insufficient-permission' ||
        code === 'auth/project-not-found') {
        return 'Firebase admin credentials are misconfigured for this project.';
    }
    return 'Invalid or expired token';
}
async function requireAuth(req, res, next) { const token = (req.headers.authorization || '').replace('Bearer ', ''); if (!token)
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
    console.error('Auth error:', e.code || e.message);
    res.status(401).json({ error: getAuthErrorMessage(e) });
} }
const allowRoles = (...roles) => (req, res, next) => req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });
exports.allowRoles = allowRoles;
