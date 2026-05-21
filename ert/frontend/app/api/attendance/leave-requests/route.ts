import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@/types';
import {
  handleRouteError,
  requireApiUser
} from '@/lib/server/api';
import { adminDb } from '@/lib/server/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const privilegedRoles: Role[] = [
  'CEO',
  'Admin',
  'Head Manager',
  'Team Manager',
  'HR'
];

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser(request);
    const isPrivileged = privilegedRoles.includes(user.role);

    const query = isPrivileged
      ? adminDb.collection('leave_requests')
      : adminDb.collection('leave_requests').where('userId', '==', user.uid);

    const snapshot = await query.get();
    const requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    requests.sort((a: any, b: any) => {
      const left =
        typeof b.createdAt?.toDate === 'function'
          ? b.createdAt.toDate().getTime()
          : new Date(b.createdAt || 0).getTime();
      const right =
        typeof a.createdAt?.toDate === 'function'
          ? a.createdAt.toDate().getTime()
          : new Date(a.createdAt || 0).getTime();

      return left - right;
    });

    return NextResponse.json(requests);
  } catch (error) {
    return handleRouteError(error);
  }
}
