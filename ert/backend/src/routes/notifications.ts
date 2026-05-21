import { Router } from 'express'; import { db } from '../config/firebaseAdmin'; import { requireAuth } from '../middleware/auth'; import { asyncHandler } from '../utils/asyncHandler';
const router=Router(); router.use(requireAuth);
router.get('/', asyncHandler(async(req,res)=>{ const snap=await db.collection('notifications').where('userId','in',[req.user!.uid,'all']).orderBy('createdAt','desc').limit(100).get(); res.json(snap.docs.map(d=>({id:d.id,...d.data()}))); }));
router.patch('/:id/read', asyncHandler(async(req,res)=>{ await db.collection('notifications').doc(req.params.id).update({read:true}); res.json({ok:true}); }));
export default router;
