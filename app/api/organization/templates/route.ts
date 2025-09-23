import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import {
  getMergedTemplates,
  recordTemplateUsage,
} from '@/lib/db/queries-content';
import { cache } from '@/lib/cache';
import { CacheKeys, CACHE_TTL } from '@/lib/types/api';

const listParamsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'category', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const trackUsageSchema = z.object({
  templateId: z.number(),
  usageType: z.enum(['viewed', 'copied', 'instantiated']),
  metadata: z.record(z.any()).optional(),
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

    // Try to get from cache first
    const cacheKey = `merged_templates:${team.id}:${params.category || 'all'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
      });
    }

    // Fetch merged templates (system + organization)
    const templates = await getMergedTemplates(team.id, params.category);

    // Apply search filter if provided
    let filteredTemplates = templates;
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredTemplates = templates.filter(template =>
        template.title.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (params.sortBy) {
      const sortField = params.sortBy;
      const order = params.sortOrder === 'desc' ? -1 : 1;

      filteredTemplates.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }

        if (aVal instanceof Date && bVal instanceof Date) {
          return (aVal.getTime() - bVal.getTime()) * order;
        }

        return 0;
      });
    }

    // Cache the result
    cache.set(cacheKey, filteredTemplates, CACHE_TTL.SYSTEM_TEMPLATES);

    return NextResponse.json({
      success: true,
      data: filteredTemplates,
    });
  } catch (error) {
    console.error('Error fetching organization templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const data = trackUsageSchema.parse(body);

    // Record template usage for analytics
    await recordTemplateUsage({
      templateId: data.templateId,
      organizationId: team.id,
      userId: user.id,
      usageType: data.usageType,
      metadata: data.metadata || {},
    });

    return NextResponse.json({
      success: true,
      message: 'Template usage recorded',
    });
  } catch (error) {
    console.error('Error recording template usage:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record template usage',
      },
      { status: 500 }
    );
  }
}