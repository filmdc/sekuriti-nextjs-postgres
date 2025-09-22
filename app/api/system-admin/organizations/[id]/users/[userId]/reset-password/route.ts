import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { users, ActivityType } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';

// POST /api/system-admin/organizations/[id]/users/[userId]/reset-password - Reset user password
export const POST = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { id: string, userId: string }, user: any }
) => {
  try {
    const orgId = parseInt(context.params.id);
    const userId = parseInt(context.params.userId);

    // Generate a temporary password
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
    const passwordHash = await hashPassword(tempPassword);

    // Update user password
    await db
      .update(users)
      .set({
        passwordHash,
        // You might want to add a flag to force password change on next login
      })
      .where(eq(users.id, userId));

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.RESET_PASSWORD,
      entityType: 'user',
      entityId: userId,
      organizationId: orgId,
    });

    return NextResponse.json({
      success: true,
      tempPassword,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting user password:', error);
    return NextResponse.json(
      { error: 'Failed to reset user password' },
      { status: 500 }
    );
  }
});