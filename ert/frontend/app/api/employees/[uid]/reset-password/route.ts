import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebase-admin';
import {
  assertRole,
  handleRouteError,
  requireApiUser,
  writeAuditLog
} from '@/lib/server/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    uid: string;
  };
};

const resetPasswordSchema = z.object({
  password: z.string().min(8).optional()
});

function generatePassword() {
  return `Axienta@${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireApiUser(request);
    assertRole(user, ['CEO', 'Admin', 'Head Manager']);

    const payload = resetPasswordSchema.parse(await request.json());
    const password = payload.password || generatePassword();

    await getAdminAuth().updateUser(context.params.uid, { password });
    await getAdminDb().collection('notifications').add({
      userId: context.params.uid,
      type: 'password_reset',
      title: 'Password reset by admin',
      read: false,
      createdAt: new Date().toISOString()
    });

    await writeAuditLog(request, user, 'employee.reset_password', {
      targetUid: context.params.uid
    });

    return NextResponse.json({
      uid: context.params.uid,
      temporaryPassword: password
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
