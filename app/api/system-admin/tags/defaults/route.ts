import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import {
  getDefaultTags,
  createDefaultTag,
} from '@/lib/db/queries-content';
import { cache, CacheInvalidation } from '@/lib/cache';
import { CacheKeys, CACHE_TTL } from '@/lib/types/api';

const createDefaultTagSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tagSet: z.array(z.object({
    name: z.string().min(1).max(50),
    category: z.enum([
      'location',
      'department',
      'criticality',
      'compliance',
      'incident_type',
      'skill',
      'custom'
    ]),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    description: z.string().optional(),
  })).min(1),
  entityTypes: z.array(z.enum([
    'asset',
    'incident',
    'runbook',
    'communication',
    'exercise'
  ])).min(1),
  isRequired: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const listParamsSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  isActive: z.coerce.boolean().optional(),
  isRequired: z.coerce.boolean().optional(),
});

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = listParamsSchema.parse(Object.fromEntries(searchParams));

    // Try to get from cache first
    const cacheKey = CacheKeys.defaultTags();
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        pagination: cached.pagination,
      });
    }

    // Fetch from database
    const result = await getDefaultTags({
      ...params,
      filters: {
        isActive: params.isActive,
        isRequired: params.isRequired,
      },
    });

    // Cache the result
    cache.set(cacheKey, result, CACHE_TTL.DEFAULT_TAGS);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching default tags:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch default tags',
      },
      { status: 400 }
    );
  }
}

async function handlePOST(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const data = createDefaultTagSchema.parse(body);

    const defaultTag = await createDefaultTag({
      ...data,
      isRequired: data.isRequired || false,
      sortOrder: data.sortOrder || 0,
      isActive: true,
      createdBy: context.user.id,
      updatedBy: context.user.id,
    });

    // Invalidate cache
    CacheInvalidation.invalidateDefaultTags();

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'CREATE_DEFAULT_TAG_SET',
      entityType: 'default_tag_set',
      entityId: defaultTag.id,
      changes: data,
      metadata: {
        tagSetName: data.name,
        tagCount: data.tagSet.length,
        entityTypes: data.entityTypes,
        isRequired: data.isRequired,
      },
    });

    return NextResponse.json({
      success: true,
      data: defaultTag,
      message: 'Default tag set created successfully',
    });
  } catch (error) {
    console.error('Error creating default tag set:', error);

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
        error: error instanceof Error ? error.message : 'Failed to create default tag set',
      },
      { status: 500 }
    );
  }
}

export const GET = withSystemAdmin(handleGET);
export const POST = withSystemAdmin(handlePOST);
