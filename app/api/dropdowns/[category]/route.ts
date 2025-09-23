import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { getMergedDropdowns } from '@/lib/db/queries-content';
import { cache } from '@/lib/cache';
import { CacheKeys, CACHE_TTL } from '@/lib/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    const category = params.category;

    // Validate category
    const validCategories = [
      'asset_types',
      'criticality_levels',
      'incident_classifications',
      'severity_levels',
      'departments',
      'locations',
      'vendor_types',
      'compliance_frameworks',
      'custom'
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid dropdown category' },
        { status: 400 }
      );
    }

    // Try to get from cache first
    const cacheKey = CacheKeys.mergedDropdowns(team.id, category);
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
      });
    }

    // Fetch merged dropdowns (system + organization overrides)
    const dropdowns = await getMergedDropdowns(team.id, category);

    // Cache the result
    cache.set(cacheKey, dropdowns, CACHE_TTL.MERGED_DROPDOWNS);

    return NextResponse.json({
      success: true,
      data: dropdowns,
    });
  } catch (error) {
    console.error('Error fetching merged dropdowns:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dropdowns',
      },
      { status: 500 }
    );
  }
}