import { Router } from 'express'; import { db } from '../config/firebaseAdmin'; import { requireAuth } from '../middleware/auth'; import { asyncHandler } from '../utils/asyncHandler';
const router=Router(); router.use(requireAuth);
router.post('/call-log', asyncHandler(async(req,res)=>{ const ref=await db.collection('call_logs').add({...req.body, userId:req.user!.uid, createdAt:new Date().toISOString()}); res.status(201).json({id:ref.id}); }));
router.post('/whatsapp', asyncHandler(async(req,res)=>{ const ref=await db.collection('messages').add({channel:'whatsapp', ...req.body, userId:req.user!.uid, providerStatus:'queued', createdAt:new Date().toISOString()}); res.status(202).json({id:ref.id, status:'queued', note:'Connect WhatsApp Business API token in production.'}); }));
export default router;
