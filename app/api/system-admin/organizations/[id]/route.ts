import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, users, ActivityType } from '@/lib/db/schema';
import { incidents, assets } from '@/lib/db/schema-ir';
import { organizationLimits } from '@/lib/db/schema-system';
import { eq, sql } from 'drizzle-orm';

// GET /api/system-admin/organizations/[id] - Get organization details
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }>, user: any }
) => {
  try {
    const params = await context.params;
    const orgId = parseInt(params.id);

    const [organization] = await db
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
        address: teams.address,
        phone: teams.phone,
        allowedEmailDomains: teams.allowedEmailDomains,
        features: teams.features,
        metadata: teams.metadata,
        stripeCustomerId: teams.stripeCustomerId,
        stripeSubscriptionId: teams.stripeSubscriptionId,
        planName: teams.planName,
        subscriptionStatus: teams.subscriptionStatus,
        // Statistics
        userCount: sql<number>`(
          SELECT COUNT(*) FROM team_members WHERE team_id = teams.id
        )`,
        incidentCount: sql<number>`(
          SELECT COUNT(*) FROM incidents WHERE organization_id = teams.id
        )`,
        assetCount: sql<number>`(
          SELECT COUNT(*) FROM assets WHERE organization_id = teams.id AND deleted_at IS NULL
        )`,
      })
      .from(teams)
      .where(eq(teams.id, orgId))
      .limit(1);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get organization limits
    const [limits] = await db
      .select()
      .from(organizationLimits)
      .where(eq(organizationLimits.organizationId, orgId))
      .limit(1);

    // Get recent users
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, orgId))
      .orderBy(sql`${teamMembers.joinedAt} DESC`)
      .limit(10);

    return NextResponse.json({
      organization,
      limits,
      recentUsers,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization details' },
      { status: 500 }
    );
  }
});

// PUT /api/system-admin/organizations/[id] - Update organization
export const PUT = withSystemAdmin(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }>, user: any }
) => {
  try {
    const params = await context.params;
    const orgId = parseInt(params.id);
    const data = await req.json();

    // Get current organization data for comparison
    const [currentOrg] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, orgId))
      .limit(1);

    if (!currentOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Update organization
    const [updatedOrg] = await db
      .update(teams)
      .set({
        name: data.name || currentOrg.name,
        industry: data.industry,
        size: data.size,
        website: data.website,
        phone: data.phone,
        address: data.address,
        customDomain: data.customDomain,
        allowedEmailDomains: data.allowedEmailDomains,
        licenseType: data.licenseType || currentOrg.licenseType,
        licenseCount: data.licenseCount || currentOrg.licenseCount,
        status: data.status || currentOrg.status,
        expiresAt: data.expiresAt,
        features: data.features ? JSON.stringify(data.features) : currentOrg.features,
        metadata: data.metadata ? JSON.stringify(data.metadata) : currentOrg.metadata,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, orgId))
      .returning();

    // Update organization limits if provided
    if (data.limits) {
      const existingLimits = await db
        .select()
        .from(organizationLimits)
        .where(eq(organizationLimits.organizationId, orgId))
        .limit(1);

      if (existingLimits.length > 0) {
        await db
          .update(organizationLimits)
          .set({
            maxUsers: data.limits.maxUsers || existingLimits[0].maxUsers,
            maxIncidents: data.limits.maxIncidents,
            maxAssets: data.limits.maxAssets,
            maxRunbooks: data.limits.maxRunbooks,
            maxTemplates: data.limits.maxTemplates,
            maxStorageMb: data.limits.maxStorageMb,
            customDomainsAllowed: data.limits.customDomainsAllowed,
            whitelabelingAllowed: data.limits.whitelabelingAllowed,
            ssoAllowed: data.limits.ssoAllowed,
            apiAccessAllowed: data.limits.apiAccessAllowed,
            updatedAt: new Date(),
          })
          .where(eq(organizationLimits.organizationId, orgId));
      }
    }

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.UPDATE_ORGANIZATION,
      entityType: 'organization',
      entityId: orgId,
      organizationId: orgId,
      changes: {
        before: currentOrg,
        after: updatedOrg,
      },
    });

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
});

// DELETE /api/system-admin/organizations/[id] - Delete organization
export const DELETE = withSystemAdmin(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }>, user: any }
) => {
  try {
    const params = await context.params;
    const orgId = parseInt(params.id);

    // Check if organization exists
    const [org] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, orgId))
      .limit(1);

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check for active data
    const [incidentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(incidents)
      .where(eq(incidents.organizationId, orgId));

    const [assetCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(eq(assets.organizationId, orgId));

    if (incidentCount.count > 0 || assetCount.count > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete organization with existing data',
          details: {
            incidents: incidentCount.count,
            assets: assetCount.count,
          }
        },
        { status: 400 }
      );
    }

    // Delete team members first
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.teamId, orgId));

    // Delete organization limits
    await db
      .delete(organizationLimits)
      .where(eq(organizationLimits.organizationId, orgId));

    // Delete the organization
    await db
      .delete(teams)
      .where(eq(teams.id, orgId));

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.DELETE_ORGANIZATION,
      entityType: 'organization',
      entityId: orgId,
      organizationId: orgId,
      metadata: {
        organizationName: org.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
});