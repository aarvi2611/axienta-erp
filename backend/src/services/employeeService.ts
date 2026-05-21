import { auth, db } from '../config/firebaseAdmin';
export async function createEmployee(input:any, createdBy:string) {
  const employeeId = input.employeeId || `AX-${input.role?.split(' ')[0]?.toUpperCase() || 'EMP'}-${Date.now().toString().slice(-6)}`;
  const user = await auth.createUser({ email: input.email, password: input.password, displayName: input.name, disabled: false });
  const profile = { uid:user.uid, employeeId, name:input.name, email:input.email, role:input.role, department:input.department, phone:input.phone||'', status:'active', createdBy, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
  await db.collection('users').doc(user.uid).set(profile); await db.collection('employees').doc(user.uid).set(profile);
  await auth.setCustomUserClaims(user.uid, { role: input.role, employeeId });
  return { ...profile, temporaryPassword: input.password };
}
export async function resetEmployeePassword(uid:string, password:string) { await auth.updateUser(uid, { password }); await db.collection('notifications').add({ userId:uid, type:'password_reset', title:'Password reset by admin', createdAt:new Date().toISOString(), read:false }); return { uid, temporaryPassword: password }; }
export async function deleteEmployee(uid:string) { await auth.deleteUser(uid); await db.collection('users').doc(uid).delete(); await db.collection('employees').doc(uid).delete(); }
