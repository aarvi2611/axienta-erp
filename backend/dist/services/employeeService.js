"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployee = createEmployee;
exports.resetEmployeePassword = resetEmployeePassword;
exports.deleteEmployee = deleteEmployee;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
async function createEmployee(input, createdBy) {
    const employeeId = input.employeeId || `AX-${input.role?.split(' ')[0]?.toUpperCase() || 'EMP'}-${Date.now().toString().slice(-6)}`;
    const user = await firebaseAdmin_1.auth.createUser({ email: input.email, password: input.password, displayName: input.name, disabled: false });
    const profile = { uid: user.uid, employeeId, name: input.name, email: input.email, role: input.role, department: input.department, phone: input.phone || '', status: 'active', createdBy, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await firebaseAdmin_1.db.collection('users').doc(user.uid).set(profile);
    await firebaseAdmin_1.db.collection('employees').doc(user.uid).set(profile);
    await firebaseAdmin_1.auth.setCustomUserClaims(user.uid, { role: input.role, employeeId });
    return { ...profile, temporaryPassword: input.password };
}
async function resetEmployeePassword(uid, password) { await firebaseAdmin_1.auth.updateUser(uid, { password }); await firebaseAdmin_1.db.collection('notifications').add({ userId: uid, type: 'password_reset', title: 'Password reset by admin', createdAt: new Date().toISOString(), read: false }); return { uid, temporaryPassword: password }; }
async function deleteEmployee(uid) { await firebaseAdmin_1.auth.deleteUser(uid); await firebaseAdmin_1.db.collection('users').doc(uid).delete(); await firebaseAdmin_1.db.collection('employees').doc(uid).delete(); }
