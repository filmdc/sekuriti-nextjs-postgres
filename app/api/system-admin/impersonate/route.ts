import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { users, teamMembers, ActivityType } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { setSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';

// POST /api/system-admin/impersonate - Impersonate a user
export const POST = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    const { userId, organizationId } = await req.json();

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'User ID and Organization ID are required' },
        { status: 400 }
      );
    }

    // Verify the user exists and belongs to the organization
    const [targetUser] = await db
      .select({
        user: users,
        membership: teamMembers,
      })
      .from(users)
      .innerJoin(
        teamMembers,
        and(
          eq(users.id, userId),
          eq(teamMembers.userId, userId),
          eq(teamMembers.teamId, organizationId)
        )
      )
      .limit(1);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found in the specified organization' },
        { status: 404 }
      );
    }

    // Store the original admin session in a separate cookie
    const cookieStore = await cookies();
    const currentSession = cookieStore.get('session');

    if (currentSession) {
      // Store the admin session for later restoration
      cookieStore.set('adminSession', currentSession.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour impersonation limit
      });
    }

    // Set a flag to indicate impersonation
    cookieStore.set('impersonating', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    // Store the system admin ID for audit purposes
    cookieStore.set('impersonatorId', context.user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    // Set the new user session
    await setSession(targetUser.user);

    // Log the impersonation action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.IMPERSONATE_USER,
      entityType: 'user',
      entityId: userId,
      organizationId,
      metadata: {
        targetUserEmail: targetUser.user.email,
        targetUserName: targetUser.user.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Impersonation session started',
    });
  } catch (error) {
    console.error('Error impersonating user:', error);
    return NextResponse.json(
      { error: 'Failed to impersonate user' },
      { status: 500 }
    );
  }
});

// POST /api/system-admin/impersonate/stop - Stop impersonation
export const DELETE = async (req: NextRequest) => {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('adminSession');
    const impersonatorId = cookieStore.get('impersonatorId');

    if (!adminSession) {
      return NextResponse.json(
        { error: 'No admin session found' },
        { status: 400 }
      );
    }

    // Restore the admin session
    cookieStore.set('session', adminSession.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Clear impersonation cookies
    cookieStore.delete('adminSession');
    cookieStore.delete('impersonating');
    cookieStore.delete('impersonatorId');

    // Log the action
    if (impersonatorId) {
      await logSystemAction({
        userId: parseInt(impersonatorId.value),
        action: ActivityType.STOP_IMPERSONATION,
        entityType: 'system',
        entityId: 0,
        organizationId: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Impersonation session ended',
    });
  } catch (error) {
    console.error('Error stopping impersonation:', error);
    return NextResponse.json(
      { error: 'Failed to stop impersonation' },
      { status: 500 }
    );
  }
};