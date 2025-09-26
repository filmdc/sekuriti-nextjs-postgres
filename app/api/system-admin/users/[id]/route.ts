import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { users, teamMembers, ActivityType } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET /api/system-admin/users/[id] - Get user details
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string }, user: any, isSystemAdmin: boolean }
) => {
  try {
    const params = await Promise.resolve(context.params);
    const userId = parseInt(params.id);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
});

// PUT /api/system-admin/users/[id] - Update user
export const PUT = withSystemAdmin(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string }, user: any, isSystemAdmin: boolean }
) => {
  try {
    const params = await Promise.resolve(context.params);
    const userId = parseInt(params.id);
    const { name, email, isSystemAdmin, isOrganizationAdmin } = await req.json();

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

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        name,
        email,
        isSystemAdmin: isSystemAdmin !== undefined ? isSystemAdmin : existingUser.isSystemAdmin,
        isOrganizationAdmin: isOrganizationAdmin !== undefined ? isOrganizationAdmin : existingUser.isOrganizationAdmin,
      })
      .where(eq(users.id, userId))
      .returning();

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.UPDATE_USER,
      entityType: 'user',
      entityId: userId,
      organizationId: 0, // System-level action
      changes: {
        before: existingUser,
        after: updatedUser,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
});

// DELETE /api/system-admin/users/[id] - Delete user
export const DELETE = withSystemAdmin(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string }, user: any, isSystemAdmin: boolean }
) => {
  try {
    const params = await Promise.resolve(context.params);
    const userId = parseInt(params.id);

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

    // Prevent deleting system admins if they are the last one
    if (existingUser.isSystemAdmin) {
      const [adminCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isSystemAdmin, true));

      if (adminCount.count <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last system administrator' },
          { status: 400 }
        );
      }
    }

    // Delete all team memberships
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.userId, userId));

    // Soft delete the user
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
      })
      .where(eq(users.id, userId));

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.DELETE_USER,
      entityType: 'user',
      entityId: userId,
      organizationId: 0, // System-level action
      metadata: {
        userEmail: existingUser.email,
        userName: existingUser.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
});