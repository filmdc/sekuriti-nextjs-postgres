import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, users, teamMembers } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

// GET /api/system-admin/licenses - Get license allocations for all organizations
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    // Fetch all organizations with user counts
    const organizations = await db
      .select({
        id: teams.id,
        name: teams.name,
        licenseType: teams.licenseType,
        licenseCount: teams.licenseCount,
        status: teams.status,
        planName: teams.planName,
        createdAt: teams.createdAt,
        stripeCustomerId: teams.stripeCustomerId,
        stripeSubscriptionId: teams.stripeSubscriptionId,
        stripeSubscriptionStatus: teams.stripeSubscriptionStatus,
        userCount: sql<number>`COUNT(DISTINCT ${teamMembers.userId})`,
      })
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .groupBy(teams.id)
      .orderBy(desc(teams.createdAt));

    // Calculate statistics
    const stats = {
      totalOrganizations: organizations.length,
      totalLicenses: organizations.reduce((sum, org) => sum + (org.licenseCount || 0), 0),
      usedLicenses: organizations.reduce((sum, org) => sum + (org.userCount || 0), 0),
      overAllocated: organizations.filter(org => (org.userCount || 0) > (org.licenseCount || 0)).length,
    };

    // Format the data for the frontend
    const allocations = organizations.map(org => ({
      id: org.id,
      organizationId: org.id,
      organizationName: org.name,
      licenseType: org.licenseType || 'standard',
      totalLicenses: org.licenseCount || 5,
      usedLicenses: org.userCount || 0,
      status: org.status || 'active',
      planName: org.planName || 'Free',
      billingCycle: org.stripeSubscriptionId ? 'monthly' : 'none',
      createdAt: org.createdAt,
      stripeStatus: org.stripeSubscriptionStatus,
    }));

    return NextResponse.json({
      allocations,
      stats,
    });
  } catch (error) {
    console.error('Error fetching license allocations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license allocations' },
      { status: 500 }
    );
  }
});

// PUT /api/system-admin/licenses/:id - Update license allocation
export const PUT = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    const { organizationId, licenseCount, licenseType } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Update the organization's license allocation
    const updated = await db
      .update(teams)
      .set({
        licenseCount: licenseCount,
        licenseType: licenseType,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, organizationId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: updated[0],
    });
  } catch (error) {
    console.error('Error updating license allocation:', error);
    return NextResponse.json(
      { error: 'Failed to update license allocation' },
      { status: 500 }
    );
  }
});