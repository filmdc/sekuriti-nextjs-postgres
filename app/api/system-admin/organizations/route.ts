import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, users, ActivityType } from '@/lib/db/schema';
import { subscriptions, subscriptionPlans } from '@/lib/db/schema-billing';
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
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        trialEndsAt: teams.trialEndsAt,
        industry: teams.industry,
        size: teams.size,
        customDomain: teams.customDomain,
        website: teams.website,
        // Get subscription info
        planName: sql<string>`(
          SELECT p.display_name FROM subscriptions s
          JOIN subscription_plans p ON s.plan_id = p.id
          WHERE s.organization_id = teams.id
          AND s.status = 'active'
          LIMIT 1
        )`,
        maxUsers: sql<number>`(
          SELECT p.max_users FROM subscriptions s
          JOIN subscription_plans p ON s.plan_id = p.id
          WHERE s.organization_id = teams.id
          AND s.status = 'active'
          LIMIT 1
        )`,
        // Get counts via subqueries
        userCount: sql<number>`(
          SELECT COALESCE(COUNT(*), 0) FROM team_members
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
      planId, // ID of the subscription plan to assign
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
        industry,
        size,
        customDomain,
        website,
        trialEndsAt,
      })
      .returning();

    // Add owner to team
    await db.insert(teamMembers).values({
      userId: ownerId,
      teamId: organization.id,
      role: 'owner',
    });

    // Create subscription if planId is provided
    if (planId) {
      const [plan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId))
        .limit(1);

      if (plan) {
        await db.insert(subscriptions).values({
          organizationId: organization.id,
          planId: plan.id,
          status: trialDays ? 'trialing' : 'active',
          billingInterval: 'monthly',
          price: plan.monthlyPrice,
          currency: plan.currency || 'USD',
          startDate: new Date(),
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialStart: trialDays ? new Date() : null,
          trialEnd: trialEndsAt,
          createdBy: ownerId,
        });
      }
    }

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
        planId,
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