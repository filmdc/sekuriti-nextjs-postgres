import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { getOrganizationLimits, ensureOrganizationLimits } from '@/lib/middleware/quota-enforcement';
import { getAvailableFeatures } from '@/lib/auth/license-gating';
import { LimitsResponse } from '@/lib/types/api-responses';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Ensure limits exist for this organization
    await ensureOrganizationLimits(team.id);

    // Get current limits
    const limits = await getOrganizationLimits(team.id);
    if (!limits) {
      return NextResponse.json({ error: 'Failed to retrieve limits' }, { status: 500 });
    }

    // Get available features for this license
    const features = getAvailableFeatures(team);

    const response: LimitsResponse = {
      success: true,
      data: {
        limits,
        features,
        licenseType: team.licenseType || 'starter',
        organizationId: team.id
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching organization limits:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization limits',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}