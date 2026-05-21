import admin from 'firebase-admin'; import { Router } from 'express'; import { db } from '../config/firebaseAdmin'; import { requireAuth, allowRoles } from '../middleware/auth'; import { asyncHandler } from '../utils/asyncHandler';
const router=Router(); router.use(requireAuth);
router.post('/check-in', asyncHandler(async(req,res)=>{ const id=`${req.user!.uid}_${new Date().toISOString().slice(0,10)}`; await db.collection('attendance').doc(id).set({userId:req.user!.uid, date:new Date().toISOString().slice(0,10), checkIn:new Date().toISOString(), status:'Present'}, {merge:true}); res.json({ok:true}); }));
router.post('/check-out', asyncHandler(async(req,res)=>{ const id=`${req.user!.uid}_${new Date().toISOString().slice(0,10)}`; await db.collection('attendance').doc(id).set({checkOut:new Date().toISOString()}, {merge:true}); res.json({ok:true}); }));
router.get('/', allowRoles('CEO','Admin','Head Manager','HR'), asyncHandler(async(_req,res)=>{ const snap=await db.collection('attendance').orderBy('date','desc').limit(500).get(); res.json(snap.docs.map(d=>({id:d.id,...d.data()}))); }));
router.get('/leave-requests', asyncHandler(async(req,res)=>{ const query = ['CEO','Admin','Head Manager','Team Manager','HR'].includes(req.user!.role)
    ? db.collection('leave_requests')
    : db.collection('leave_requests').where('userId', '==', req.user!.uid);
  const snap = await query.get();
  const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
  const getTime = (value: any) => {
    if (!value) return 0;
    if (typeof value.toDate === 'function') return value.toDate().getTime();
    return new Date(value).getTime();
  };
  requests.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
  res.json(requests);
}));
router.post('/leave-request', asyncHandler(async(req,res)=>{ const ref=await db.collection('leave_requests').add({ ...req.body, userId:req.user!.uid, status:'Pending', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }); res.status(201).json({id:ref.id}); }));
router.patch('/leave-request/:id', allowRoles('CEO','Admin','Head Manager','Team Manager','HR'), asyncHandler(async(req,res)=>{ await db.collection('leave_requests').doc(req.params.id).update({ ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() }); res.json({ok:true}); }));
export default router;
