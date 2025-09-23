import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { getMergedDropdowns } from '@/lib/db/queries-content';
import { cache } from '@/lib/cache';
import { CacheKeys, CACHE_TTL } from '@/lib/types/api';

const listParamsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const params = listParamsSchema.parse(Object.fromEntries(searchParams));

    // Validate category if provided
    if (params.category) {
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

      if (!validCategories.includes(params.category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid dropdown category' },
          { status: 400 }
        );
      }
    }

    // Try to get from cache first
    const cacheKey = CacheKeys.mergedDropdowns(team.id, params.category);
    const cached = cache.get(cacheKey);

    if (cached) {
      let filteredDropdowns = cached;

      // Apply search filter if provided
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredDropdowns = cached.filter((dropdown: any) =>
          dropdown.name.toLowerCase().includes(searchLower) ||
          dropdown.description?.toLowerCase().includes(searchLower) ||
          dropdown.options.some((option: any) =>
            option.label.toLowerCase().includes(searchLower) ||
            option.value.toLowerCase().includes(searchLower)
          )
        );
      }

      return NextResponse.json({
        success: true,
        data: filteredDropdowns,
      });
    }

    // Fetch merged dropdowns (system + organization overrides)
    const dropdowns = await getMergedDropdowns(team.id, params.category);

    // Apply search filter if provided
    let filteredDropdowns = dropdowns;
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredDropdowns = dropdowns.filter(dropdown =>
        dropdown.name.toLowerCase().includes(searchLower) ||
        dropdown.description?.toLowerCase().includes(searchLower) ||
        dropdown.options.some(option =>
          option.label.toLowerCase().includes(searchLower) ||
          option.value.toLowerCase().includes(searchLower)
        )
      );
    }

    // Cache the result (cache unfiltered data)
    cache.set(cacheKey, dropdowns, CACHE_TTL.MERGED_DROPDOWNS);

    return NextResponse.json({
      success: true,
      data: filteredDropdowns,
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