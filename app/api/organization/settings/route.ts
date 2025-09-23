import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, activityLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

    // Fetch organization settings
    const [organization] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, organizationId));

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Return settings with default values for missing fields
    const settings = {
      id: organization.id,
      name: organization.name || '',
      industry: organization.industry || '',
      size: organization.size || '',
      address: organization.address || '',
      phone: organization.phone || '',
      website: organization.website || '',
      email: '', // Would come from a separate org settings table
      timezone: 'America/New_York', // Default, would be stored in settings
      notificationPreferences: {
        emailAlerts: true,
        smsAlerts: false,
        incidentNotifications: true,
        dailyDigest: false,
        weeklyReport: true
      },
      securitySettings: {
        requireTwoFactor: false,
        sessionTimeout: 30,
        ipWhitelist: []
      }
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

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

    // Check if user has permission to update settings (admin or owner)
    if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update organization settings
    // Note: email field is part of the frontend form but needs to be handled separately
    // as it's not part of the teams table - it would be stored in a separate org settings table
    await db
      .update(teams)
      .set({
        name: body.name,
        industry: body.industry,
        size: body.size,
        address: body.address,
        phone: body.phone,
        website: body.website,
        updatedAt: new Date()
      })
      .where(eq(teams.id, organizationId));

    // Log the activity
    await db.insert(activityLogs).values({
      teamId: organizationId,
      userId: user.id,
      action: ActivityType.UPDATE_ACCOUNT,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json(
      { error: 'Failed to update organization settings' },
      { status: 500 }
    );
  }
}