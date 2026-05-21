import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminFieldValue } from '@/lib/server/firebase-admin';
import {
  assertRole,
  handleRouteError,
  requireApiUser
} from '@/lib/server/api';
import { leaveRequestUpdateSchema } from '@/lib/server/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    assertRole(user, ['CEO', 'Admin', 'Head Manager', 'Team Manager', 'HR']);

    const payload = leaveRequestUpdateSchema.parse(await request.json());

    await adminDb.collection('leave_requests').doc(context.params.id).update({
      ...payload,
      updatedAt: adminFieldValue.serverTimestamp()
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
