import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { invitations, teamMembers, users, activityLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { ActivityType } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const memberRecord = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organizationId = memberRecord[0].teamId;

    // Fetch all invitations for the organization
    const invitationsList = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        invitedBy: users.name,
        invitedAt: invitations.invitedAt,
        status: invitations.status
      })
      .from(invitations)
      .innerJoin(users, eq(invitations.invitedBy, users.id))
      .where(eq(invitations.teamId, organizationId));

    return NextResponse.json(invitationsList);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role, message } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Get user's organization and verify they have permission
    const memberRecord = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organizationId = memberRecord[0].teamId;
    const userRole = memberRecord[0].role;

    // Check if user has permission to invite members (admin or owner)
    if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      // Check if user is already a member
      const [existingMember] = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, existingUser.id),
            eq(teamMembers.teamId, organizationId)
          )
        );

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
      }
    }

    // Check if invitation already exists
    const [existingInvitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, organizationId),
          eq(invitations.status, 'pending')
        )
      );

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 });
    }

    // Create invitation
    await db.insert(invitations).values({
      teamId: organizationId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    });

    // Log the activity
    await db.insert(activityLogs).values({
      teamId: organizationId,
      userId: user.id,
      action: ActivityType.INVITE_TEAM_MEMBER,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    });

    // TODO: Send invitation email

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}