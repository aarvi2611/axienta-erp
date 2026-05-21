"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = audit;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
function audit(action) { return async (req, res, next) => { res.on('finish', async () => { if (req.user && res.statusCode < 400)
    await firebaseAdmin_1.db.collection('activity_logs').add({ action, userId: req.user.uid, role: req.user.role, method: req.method, path: req.originalUrl, at: new Date().toISOString(), ip: req.ip }); }); next(); }; }
