"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const express_1 = require("express");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/check-in', (0, asyncHandler_1.asyncHandler)(async (req, res) => { const id = `${req.user.uid}_${new Date().toISOString().slice(0, 10)}`; await firebaseAdmin_1.db.collection('attendance').doc(id).set({ userId: req.user.uid, date: new Date().toISOString().slice(0, 10), checkIn: new Date().toISOString(), status: 'Present' }, { merge: true }); res.json({ ok: true }); }));
router.post('/check-out', (0, asyncHandler_1.asyncHandler)(async (req, res) => { const id = `${req.user.uid}_${new Date().toISOString().slice(0, 10)}`; await firebaseAdmin_1.db.collection('attendance').doc(id).set({ checkOut: new Date().toISOString() }, { merge: true }); res.json({ ok: true }); }));
router.get('/', (0, auth_1.allowRoles)('CEO', 'Admin', 'Head Manager', 'HR'), (0, asyncHandler_1.asyncHandler)(async (_req, res) => { const snap = await firebaseAdmin_1.db.collection('attendance').orderBy('date', 'desc').limit(500).get(); res.json(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }));
router.get('/leave-requests', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = ['CEO', 'Admin', 'Head Manager', 'Team Manager', 'HR'].includes(req.user.role)
        ? firebaseAdmin_1.db.collection('leave_requests')
        : firebaseAdmin_1.db.collection('leave_requests').where('userId', '==', req.user.uid);
    const snap = await query.get();
    const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const getTime = (value) => {
        if (!value)
            return 0;
        if (typeof value.toDate === 'function')
            return value.toDate().getTime();
        return new Date(value).getTime();
    };
    requests.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
    res.json(requests);
}));
router.post('/leave-request', (0, asyncHandler_1.asyncHandler)(async (req, res) => { const ref = await firebaseAdmin_1.db.collection('leave_requests').add({ ...req.body, userId: req.user.uid, status: 'Pending', createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(), updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp() }); res.status(201).json({ id: ref.id }); }));
router.patch('/leave-request/:id', (0, auth_1.allowRoles)('CEO', 'Admin', 'Head Manager', 'Team Manager', 'HR'), (0, asyncHandler_1.asyncHandler)(async (req, res) => { await firebaseAdmin_1.db.collection('leave_requests').doc(req.params.id).update({ ...req.body, updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp() }); res.json({ ok: true }); }));
exports.default = router;
