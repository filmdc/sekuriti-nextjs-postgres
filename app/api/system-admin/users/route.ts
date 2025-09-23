import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { users, teamMembers, teams, ActivityType } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

// GET /api/system-admin/users - Get all users across the platform
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    // Get all users with their organization memberships
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isSystemAdmin: users.isSystemAdmin,
        isOrganizationAdmin: users.isOrganizationAdmin,
        hasLoggedIn: sql<boolean>`${users.lastLoginAt} IS NOT NULL`,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Get organization memberships for each user
    const usersWithOrganizations = await Promise.all(
      allUsers.map(async (user) => {
        const memberships = await db
          .select({
            organizationId: teams.id,
            organizationName: teams.name,
            role: teamMembers.role,
          })
          .from(teamMembers)
          .innerJoin(teams, eq(teamMembers.teamId, teams.id))
          .where(eq(teamMembers.userId, user.id));

        return {
          ...user,
          organizations: memberships.map(m => ({
            id: m.organizationId,
            name: m.organizationName,
            role: m.role,
          })),
        };
      })
    );

    return NextResponse.json({
      users: usersWithOrganizations,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});