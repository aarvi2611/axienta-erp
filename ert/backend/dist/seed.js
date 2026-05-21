"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const firebaseAdmin_1 = require("./config/firebaseAdmin");
const employees = [
    { employeeId: 'AX-CEO-001', name: 'Aarav Sharma', email: 'ceo@axenta.com', password: 'Axenta@12345', role: 'CEO', department: 'Executive' },
    { employeeId: 'AX-MGR-101', name: 'Neha Verma', email: 'manager@axenta.com', password: 'Axenta@12345', role: 'Head Manager', department: 'Management' },
    { employeeId: 'AX-SAL-220', name: 'Kabir Singh', email: 'sales@axenta.com', password: 'Axenta@12345', role: 'Sales Executive', department: 'Sales' },
    { employeeId: 'AX-CALL-330', name: 'Riya Kapoor', email: 'calling@axenta.com', password: 'Axenta@12345', role: 'Calling Executive', department: 'Calling' },
    { employeeId: 'AX-OPS-410', name: 'Mohit Jain', email: 'ops@axenta.com', password: 'Axenta@12345', role: 'Operations Team', department: 'Operations' },
    { employeeId: 'AX-HR-510', name: 'Sara Khan', email: 'hr@axenta.com', password: 'Axenta@12345', role: 'HR', department: 'Human Resources' }
];
const leads = [{ businessName: 'BluePeak Technologies', phone: '+91 99887 77665', email: 'hello@bluepeak.in', address: 'Noida Sector 62', category: 'IT Services', rating: 4.6, stage: 'Interested', tags: ['hot', 'website'], source: 'Google Maps' }, { businessName: 'Royal FinServe', phone: '+91 88776 66554', address: 'Gurugram', category: 'Finance', rating: 4.3, stage: 'Follow-Up', tags: ['call-back'], source: 'CSV' }, { businessName: 'Urban Wellness Clinic', phone: '+91 77665 55443', email: 'care@urbanwellness.in', address: 'Delhi', category: 'Healthcare', rating: 4.8, stage: 'Confirmed', tags: ['confirmed'], source: 'Referral' }];
async function upsertUser(e) { let user; try {
    user = await firebaseAdmin_1.auth.getUserByEmail(e.email);
}
catch {
    user = await firebaseAdmin_1.auth.createUser({ email: e.email, password: e.password, displayName: e.name });
} const profile = { uid: user.uid, employeeId: e.employeeId, name: e.name, email: e.email, role: e.role, department: e.department, status: 'active', createdAt: new Date().toISOString() }; await firebaseAdmin_1.auth.setCustomUserClaims(user.uid, { role: e.role, employeeId: e.employeeId }); await firebaseAdmin_1.db.collection('users').doc(user.uid).set(profile, { merge: true }); await firebaseAdmin_1.db.collection('employees').doc(user.uid).set(profile, { merge: true }); }
(async () => { for (const e of employees)
    await upsertUser(e); for (const l of leads)
    await firebaseAdmin_1.db.collection('leads').add({ ...l, createdAt: new Date().toISOString() }); await firebaseAdmin_1.db.collection('departments').doc('sales').set({ name: 'Sales', active: true }); console.log('Seed complete. Demo password for all seeded users: Axenta@12345'); process.exit(0); })().catch(e => { console.error(e); process.exit(1); });
