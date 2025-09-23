import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, users, ActivityType } from '@/lib/db/schema';
import { organizationLimits } from '@/lib/db/schema-system';
import { sql, eq, desc } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';

// GET /api/system-admin/organizations - List all organizations
export const GET = withSystemAdmin(async (req: NextRequest, context: any) => {
  try {
    const organizations = await db
      .select({
        id: teams.id,
        name: teams.name,
        status: teams.status,
        licenseType: teams.licenseType,
        licenseCount: teams.licenseCount,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        expiresAt: teams.expiresAt,
        trialEndsAt: teams.trialEndsAt,
        industry: teams.industry,
        size: teams.size,
        customDomain: teams.customDomain,
        website: teams.website,
        // Get counts via subqueries
        userCount: sql<number>`(
          SELECT COALESCE(COUNT(*), 0) FROM team_members
          WHERE team_id = teams.id
        )`,
        usedLicenses: sql<number>`(
          SELECT COALESCE(COUNT(DISTINCT user_id), 0) FROM team_members
          WHERE team_id = teams.id
        )`,
        incidentCount: sql<number>`(
          SELECT COALESCE(COUNT(*), 0) FROM incidents
          WHERE organization_id = teams.id
        )`,
        assetCount: sql<number>`(
          SELECT COALESCE(COUNT(*), 0) FROM assets
          WHERE organization_id = teams.id AND deleted_at IS NULL
        )`,
      })
      .from(teams)
      .orderBy(desc(teams.createdAt));

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
});

// POST /api/system-admin/organizations - Create new organization
export const POST = withSystemAdmin(async (req: NextRequest, context: any) => {
  try {
    const data = await req.json();
    const {
      name,
      ownerEmail,
      ownerPassword,
      ownerName,
      licenseType = 'standard',
      licenseCount = 5,
      status = 'active',
      industry,
      size,
      customDomain,
      website,
      trialDays,
    } = data;

    // Validate required fields
    if (!name || !ownerEmail) {
      return NextResponse.json(
        { error: 'Organization name and owner email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ownerEmail))
      .limit(1);

    let ownerId: number;

    if (existingUser.length > 0) {
      // User exists, use their ID
      ownerId = existingUser[0].id;
    } else {
      // Create new user as organization owner
      const passwordHash = await hashPassword(ownerPassword || 'TempPass123!');
      const [newUser] = await db
        .insert(users)
        .values({
          email: ownerEmail,
          name: ownerName,
          passwordHash,
          role: 'owner',
          isOrganizationAdmin: true,
        })
        .returning();

      ownerId = newUser.id;
    }

    // Calculate trial end date if applicable
    const trialEndsAt = trialDays
      ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
      : null;

    // Create the organization
    const [organization] = await db
      .insert(teams)
      .values({
        name,
        status,
        licenseType,
        licenseCount,
        industry,
        size,
        customDomain,
        website,
        trialEndsAt,
        expiresAt: status === 'trial' ? trialEndsAt : null,
      })
      .returning();

    // Add owner to team
    await db.insert(teamMembers).values({
      userId: ownerId,
      teamId: organization.id,
      role: 'owner',
    });

    // Create organization limits
    await db.insert(organizationLimits).values({
      organizationId: organization.id,
      maxUsers: licenseCount,
      currentUsers: 1,
      maxIncidents: licenseType === 'enterprise' ? 1000 : licenseType === 'professional' ? 500 : 100,
      maxAssets: licenseType === 'enterprise' ? 5000 : licenseType === 'professional' ? 1000 : 500,
      maxRunbooks: licenseType === 'enterprise' ? 500 : licenseType === 'professional' ? 100 : 50,
      customDomainsAllowed: licenseType === 'enterprise',
      whitelabelingAllowed: licenseType === 'enterprise',
      ssoAllowed: licenseType !== 'standard',
    });

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.CREATE_ORGANIZATION,
      entityType: 'organization',
      entityId: organization.id,
      organizationId: organization.id,
      metadata: {
        name,
        ownerEmail,
        licenseType,
        licenseCount,
      },
    });

    return NextResponse.json({
      success: true,
      organization,
      message: 'Organization created successfully',
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
});