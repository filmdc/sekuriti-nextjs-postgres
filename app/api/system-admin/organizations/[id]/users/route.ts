import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { users, teamMembers, ActivityType } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';

// GET /api/system-admin/organizations/[id]/users - Get organization users
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { id: string }, user: any }
) => {
  try {
    const orgId = parseInt(context.params.id);

    const orgUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        lastLoginAt: users.lastLoginAt,
        isOrganizationAdmin: users.isOrganizationAdmin,
        emailVerified: users.emailVerified,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, orgId))
      .orderBy(teamMembers.joinedAt);

    return NextResponse.json({
      users: orgUsers,
    });
  } catch (error) {
    console.error('Error fetching organization users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization users' },
      { status: 500 }
    );
  }
});

// POST /api/system-admin/organizations/[id]/users - Add user to organization
export const POST = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { id: string }, user: any }
) => {
  try {
    const orgId = parseInt(context.params.id);
    const { email, name, role, password } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    let userId: number;
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      userId = existingUser.id;

      // Check if already a member
      const [existingMembership] = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, userId),
            eq(teamMembers.teamId, orgId)
          )
        )
        .limit(1);

      if (existingMembership) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        );
      }
    } else {
      // Create new user
      const passwordHash = await hashPassword(password || 'TempPass123!');
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          name,
          passwordHash,
          role: role || 'member',
          isOrganizationAdmin: role === 'owner' || role === 'admin',
        })
        .returning();

      userId = newUser.id;
    }

    // Add to organization
    await db.insert(teamMembers).values({
      userId,
      teamId: orgId,
      role: role || 'member',
    });

    // Update organization user count
    await db.execute(sql`
      UPDATE organization_limits
      SET current_users = (
        SELECT COUNT(DISTINCT user_id)
        FROM team_members
        WHERE team_id = ${orgId}
      )
      WHERE organization_id = ${orgId}
    `);

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.ADD_USER,
      entityType: 'user',
      entityId: userId,
      organizationId: orgId,
      metadata: {
        email,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User added successfully',
    });
  } catch (error) {
    console.error('Error adding user to organization:', error);
    return NextResponse.json(
      { error: 'Failed to add user to organization' },
      { status: 500 }
    );
  }
});