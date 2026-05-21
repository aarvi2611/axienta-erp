"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const auth_1 = require("../middleware/auth");
const audit_1 = require("../middleware/audit");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => { let q = firebaseAdmin_1.db.collection('tasks'); if (!['CEO', 'Admin', 'Head Manager', 'Team Manager'].includes(req.user.role))
    q = q.where('assignedTo', '==', req.user.uid); const snap = await q.limit(300).get(); res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }));
router.post('/', (0, auth_1.allowRoles)('CEO', 'Admin', 'Head Manager', 'Team Manager'), (0, audit_1.audit)('task.assign'), (0, asyncHandler_1.asyncHandler)(async (req, res) => { const doc = { ...req.body, createdBy: req.user.uid, status: req.body.status || 'Pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; const ref = await firebaseAdmin_1.db.collection('tasks').add(doc); await firebaseAdmin_1.db.collection('notifications').add({ userId: doc.assignedTo, type: 'task_assigned', title: 'New task assigned', body: doc.title, read: false, createdAt: new Date().toISOString() }); res.status(201).json({ id: ref.id }); }));
router.patch('/:id/status', (0, audit_1.audit)('task.status'), (0, asyncHandler_1.asyncHandler)(async (req, res) => { await firebaseAdmin_1.db.collection('tasks').doc(req.params.id).update({ status: req.body.status, updatedAt: new Date().toISOString() }); res.json({ ok: true }); }));
exports.default = router;
