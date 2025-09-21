import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { incidents, insurancePolicies } from '@/lib/db/schema-ir';
import { tags } from '@/lib/db/schema-tags';
import { eq, and, count } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

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

    // Fetch organization details
    const [organization] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, organizationId));

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Fetch additional statistics
    const [memberCount] = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, organizationId));

    // Count active incidents
    const activeIncidentsCount = await db
      .select({ count: count() })
      .from(incidents)
      .where(
        and(
          eq(incidents.organizationId, organizationId),
          eq(incidents.status, 'open')
        )
      );

    // Count insurance policies
    const insurancePoliciesCount = await db
      .select({ count: count() })
      .from(insurancePolicies)
      .where(eq(insurancePolicies.organizationId, organizationId));

    // Count compliance tags
    const complianceTagsCount = await db
      .select({ count: count() })
      .from(tags)
      .where(
        and(
          eq(tags.organizationId, organizationId),
          eq(tags.category, 'compliance')
        )
      );

    const organizationData = {
      id: organization.id,
      name: organization.name,
      industry: organization.industry,
      size: organization.size,
      address: organization.address,
      phone: organization.phone,
      website: organization.website,
      planName: organization.planName,
      subscriptionStatus: organization.subscriptionStatus,
      memberCount: memberCount.count || 0,
      activeIncidents: activeIncidentsCount[0]?.count || 0,
      insurancePolicies: insurancePoliciesCount[0]?.count || 0,
      complianceTags: complianceTagsCount[0]?.count || 0,
    };

    return NextResponse.json(organizationData);
  } catch (error) {
    console.error('Error fetching organization data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization data' },
      { status: 500 }
    );
  }
}