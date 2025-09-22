import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { users, ActivityType } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';

// POST /api/system-admin/users/[id]/reset - Reset user password
export const POST = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { id: string }, user: any }
) => {
  try {
    const userId = parseInt(context.params.id);

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a temporary password
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
    const passwordHash = await hashPassword(tempPassword);

    // Update user password
    await db
      .update(users)
      .set({
        passwordHash,
      })
      .where(eq(users.id, userId));

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.RESET_PASSWORD,
      entityType: 'user',
      entityId: userId,
      organizationId: 0, // System-level action
      metadata: {
        userEmail: existingUser.email,
      },
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