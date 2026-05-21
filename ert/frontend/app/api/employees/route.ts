import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/server/firebase-admin';
import {
  assertRole,
  handleRouteError,
  requireApiUser,
  writeAuditLog
} from '@/lib/server/api';
import { employeeCreateSchema } from '@/lib/server/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildEmployeeId(role: string) {
  return `AX-${role.split(' ')[0]?.toUpperCase() || 'EMP'}-${Date.now()
    .toString()
    .slice(-6)}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request);
    assertRole(user, ['CEO', 'Admin', 'Head Manager', 'HR']);

    const snapshot = await adminDb
      .collection('employees')
      .orderBy('createdAt', 'desc')
      .get();

    return NextResponse.json(
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser(request);
    assertRole(user, ['CEO', 'Admin', 'Head Manager']);

    const payload = employeeCreateSchema.parse(await request.json());
    const employeeId = payload.employeeId || buildEmployeeId(payload.role);
    const employeeAuthUser = await adminAuth.createUser({
      email: payload.email,
      password: payload.password,
      displayName: payload.name,
      disabled: payload.status === 'inactive'
    });

    const timestamp = new Date().toISOString();
    const profile = {
      uid: employeeAuthUser.uid,
      employeeId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      department: payload.department,
      phone: payload.phone || '',
      salary: payload.salary ?? 35000,
      leaveBalance: payload.leaveBalance ?? 12,
      bankAccount: payload.bankAccount || '',
      taxId: payload.taxId || '',
      joiningDate: payload.joiningDate || '',
      appraisalDate: payload.appraisalDate || '',
      performanceRating: payload.performanceRating ?? 4,
      status: payload.status || 'active',
      createdBy: user.uid,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await Promise.all([
      adminDb.collection('users').doc(employeeAuthUser.uid).set(profile),
      adminDb.collection('employees').doc(employeeAuthUser.uid).set(profile),
      adminAuth.setCustomUserClaims(employeeAuthUser.uid, {
        role: payload.role,
        employeeId
      })
    ]);

    await writeAuditLog(request, user, 'employee.create', {
      targetUid: employeeAuthUser.uid
    });

    return NextResponse.json(
      { ...profile, temporaryPassword: payload.password },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
