import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { getCurrentUsage, getOrganizationLimits, getQuotaSummary } from '@/lib/middleware/quota-enforcement';
import { getAvailableFeatures } from '@/lib/auth/license-gating';
import { UsageResponse } from '@/lib/types/api-responses';

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

    // Get quota summary which includes usage, limits, and percentages
    const summary = await getQuotaSummary(team.id);

    // Get available features for this license
    const features = getAvailableFeatures(team);

    const response: UsageResponse = {
      success: true,
      data: {
        usage: summary.usage,
        limits: summary.limits,
        features,
        percentages: summary.percentages
      }
    };

    // Add warnings if any resource is near limit
    if (summary.warnings.length > 0) {
      response.data.warnings = summary.warnings;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching organization usage:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organization usage',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}