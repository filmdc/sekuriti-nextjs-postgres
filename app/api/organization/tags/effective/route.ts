import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { getEffectiveTags } from '@/lib/db/queries-content';
import { cache } from '@/lib/cache';
import { CacheKeys, CACHE_TTL } from '@/lib/types/api';

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

    // Try to get from cache first
    const cacheKey = CacheKeys.effectiveTags(team.id);
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
      });
    }

    // Fetch effective tags (system defaults + organization tags)
    const effectiveTags = await getEffectiveTags(team.id);

    // Transform the data for the response
    const response = {
      systemDefaults: effectiveTags.defaultTagSets.map(tagSet => ({
        id: tagSet.id,
        name: tagSet.name,
        description: tagSet.description,
        tags: tagSet.tagSet,
        entityTypes: tagSet.entityTypes,
        isRequired: tagSet.isRequired,
      })),
      organizationTags: effectiveTags.organizationTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        category: tag.category,
        color: tag.color,
        description: tag.description,
        isSystem: tag.isSystem,
        usageCount: tag.usageCount,
      })),
    };

    // Cache the result
    cache.set(cacheKey, response, CACHE_TTL.EFFECTIVE_TAGS);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching effective tags:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch effective tags',
      },
      { status: 500 }
    );
  }
}