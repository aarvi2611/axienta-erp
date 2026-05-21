"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const XLSX = __importStar(require("xlsx"));
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const auth_1 = require("../middleware/auth");
const audit_1 = require("../middleware/audit");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.use(auth_1.requireAuth);
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => { let q = firebaseAdmin_1.db.collection('leads'); if (!['CEO', 'Admin', 'Head Manager', 'Team Manager', 'Data Scraper'].includes(req.user.role))
    q = q.where('ownerId', '==', req.user.uid); const snap = await q.limit(500).get(); res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); }));
router.post('/', (0, auth_1.allowRoles)('CEO', 'Admin', 'Head Manager', 'Team Manager', 'Sales Executive', 'Data Scraper'), (0, audit_1.audit)('lead.create'), (0, asyncHandler_1.asyncHandler)(async (req, res) => { const ref = await firebaseAdmin_1.db.collection('leads').add({ ...req.body, createdBy: req.user.uid, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); res.status(201).json({ id: ref.id }); }));
router.patch('/:id', (0, audit_1.audit)('lead.update'), (0, asyncHandler_1.asyncHandler)(async (req, res) => { await firebaseAdmin_1.db.collection('leads').doc(req.params.id).update({ ...req.body, updatedAt: new Date().toISOString() }); res.json({ ok: true }); }));
router.delete('/:id', (0, auth_1.allowRoles)('CEO', 'Admin', 'Head Manager', 'Team Manager'), (0, audit_1.audit)('lead.delete'), (0, asyncHandler_1.asyncHandler)(async (req, res) => { await firebaseAdmin_1.db.collection('leads').doc(req.params.id).delete(); res.json({ ok: true }); }));
router.post('/import', (0, auth_1.allowRoles)('CEO', 'Admin', 'Head Manager', 'Team Manager', 'Data Scraper'), upload.single('file'), (0, audit_1.audit)('lead.import'), (0, asyncHandler_1.asyncHandler)(async (req, res) => { if (!req.file)
    return res.status(400).json({ error: 'file is required' }); const wb = XLSX.read(req.file.buffer); const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]); const batch = firebaseAdmin_1.db.batch(); const seen = new Set(); let imported = 0, duplicates = 0; rows.forEach(row => { const key = (row.phone || row.Phone || row.email || row.Email || row.businessName || row['Business Name'] || '').toString().toLowerCase(); if (seen.has(key)) {
    duplicates++;
    return;
} seen.add(key); const ref = firebaseAdmin_1.db.collection('leads').doc(); batch.set(ref, { businessName: row.businessName || row['Business Name'] || row.Name || 'Untitled', phone: row.phone || row.Phone || '', email: row.email || row.Email || '', website: row.website || row.Website || '', address: row.address || row.Address || '', category: row.category || row.Category || '', rating: Number(row.rating || row.Rating || 0), stage: 'New Lead', source: 'Import', tags: ['imported'], createdAt: new Date().toISOString() }); imported++; }); await batch.commit(); res.json({ imported, duplicates }); }));
exports.default = router;
