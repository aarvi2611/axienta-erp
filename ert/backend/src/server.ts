import 'dotenv/config'; import express from 'express'; import cors from 'cors'; import helmet from 'helmet'; import rateLimit from 'express-rate-limit';
import employees from './routes/employees'; import leads from './routes/leads'; import tasks from './routes/tasks'; import attendance from './routes/attendance'; import reports from './routes/reports'; import notifications from './routes/notifications'; import communication from './routes/communication'; import maps from './routes/maps';
const app=express(); const PORT=Number(process.env.PORT||4000);
app.use(helmet()); app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'], credentials:true })); app.use(express.json({limit:'2mb'})); app.use(rateLimit({ windowMs: 60_000, limit: 240 }));
app.get('/health', (_req,res)=>res.json({ok:true, service:'Axenta ERP API', time:new Date().toISOString()}));
app.use('/api/employees', employees); app.use('/api/leads', leads); app.use('/api/tasks', tasks); app.use('/api/attendance', attendance); app.use('/api/reports', reports); app.use('/api/notifications', notifications); app.use('/api/communication', communication); app.use('/api/maps', maps);
app.use((err:any,_req:any,res:any,_next:any)=>{ console.error(err); res.status(err.status || 500).json({ error: err.message || 'Internal server error', details: err.issues || undefined }); });
app.listen(PORT,()=>console.log(`Axenta API running on http://localhost:${PORT}`));
