import { NextRequest, NextResponse } from 'next/server';
import { adminFieldValue, getAdminDb } from '@/lib/server/firebase-admin';
import {
  handleRouteError,
  requireApiUser
} from '@/lib/server/api';
import { leaveRequestCreateSchema } from '@/lib/server/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser(request);
    const payload = leaveRequestCreateSchema.parse(await request.json());
    const adminDb = getAdminDb();

    const ref = await adminDb.collection('leave_requests').add({
      ...payload,
      userId: user.uid,
      userName: user.name || user.email || 'Unknown',
      status: 'Pending',
      createdAt: adminFieldValue.serverTimestamp(),
      updatedAt: adminFieldValue.serverTimestamp()
    });

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
