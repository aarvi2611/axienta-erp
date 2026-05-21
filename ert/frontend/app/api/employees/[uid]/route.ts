import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebase-admin';
import {
  assertRole,
  handleRouteError,
  requireApiUser,
  writeAuditLog
} from '@/lib/server/api';
import { employeeUpdateSchema } from '@/lib/server/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    uid: string;
  };
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    assertRole(user, ['CEO', 'Admin', 'Head Manager', 'HR']);

    const updates = employeeUpdateSchema.parse(await request.json());
    const timestamp = new Date().toISOString();

    await Promise.all([
      getAdminDb().collection('employees').doc(context.params.uid).set(
        {
          ...updates,
          updatedAt: timestamp
        },
        { merge: true }
      ),
      getAdminDb().collection('users').doc(context.params.uid).set(
        {
          ...updates,
          updatedAt: timestamp
        },
        { merge: true }
      )
    ]);

    if (updates.name || updates.email || updates.status) {
      await getAdminAuth().updateUser(context.params.uid, {
        displayName: updates.name,
        email: updates.email,
        disabled: updates.status ? updates.status === 'inactive' : undefined
      });
    }

    if (updates.role || updates.employeeId) {
      const authUser = await getAdminAuth().getUser(context.params.uid);
      const existingClaims = authUser.customClaims || {};

      await getAdminAuth().setCustomUserClaims(context.params.uid, {
        ...existingClaims,
        role: updates.role || existingClaims.role,
        employeeId: updates.employeeId || existingClaims.employeeId
      });
    }

    await writeAuditLog(request, user, 'employee.update', {
      targetUid: context.params.uid
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    assertRole(user, ['CEO', 'Admin', 'Head Manager']);

    await Promise.all([
      getAdminDb().collection('users').doc(context.params.uid).delete(),
      getAdminDb().collection('employees').doc(context.params.uid).delete(),
      getAdminAuth().deleteUser(context.params.uid)
    ]);

    await writeAuditLog(request, user, 'employee.delete', {
      targetUid: context.params.uid
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
