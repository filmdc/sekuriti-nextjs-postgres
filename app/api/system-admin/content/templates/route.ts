import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import {
  getSystemTemplates,
  createSystemTemplate,
  recordTemplateUsage,
} from '@/lib/db/queries-content';
import { cache, CacheInvalidation } from '@/lib/cache';
import { CacheKeys, CACHE_TTL, CreateSystemTemplateRequest } from '@/lib/types/api';

const createTemplateSchema = z.object({
  title: z.string().min(1).max(255),
  category: z.enum([
    'incident_response',
    'communication',
    'runbook',
    'training',
    'compliance',
    'custom'
  ]),
  description: z.string().optional(),
  content: z.string().min(1),
  variables: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    required: z.boolean().optional(),
    defaultValue: z.any().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  sortOrder: z.number().optional(),
});

const listParamsSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'category', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = listParamsSchema.parse(Object.fromEntries(searchParams));

    // Try to get from cache first
    const cacheKey = CacheKeys.systemTemplates(params.category);
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        pagination: cached.pagination,
      });
    }

    // Fetch from database
    const result = await getSystemTemplates({
      ...params,
      filters: {
        category: params.category,
        isActive: params.isActive,
      },
    });

    // Cache the result
    cache.set(cacheKey, result, CACHE_TTL.SYSTEM_TEMPLATES);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching system templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
      },
      { status: 400 }
    );
  }
}

async function POST(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const data = createTemplateSchema.parse(body);

    const template = await createSystemTemplate({
      ...data,
      variables: data.variables || [],
      tags: data.tags || [],
      metadata: data.metadata || {},
      sortOrder: data.sortOrder || 0,
      isActive: true,
      version: '1.0',
      createdBy: context.user.id,
      updatedBy: context.user.id,
    });

    // Invalidate cache
    CacheInvalidation.invalidateSystemTemplates(data.category);
    CacheInvalidation.invalidateSystemTemplates(); // Invalidate 'all' cache

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'CREATE_SYSTEM_TEMPLATE',
      entityType: 'system_template',
      entityId: template.id,
      changes: data,
      metadata: {
        templateTitle: data.title,
        category: data.category,
      },
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template created successfully',
    });
  } catch (error) {
    console.error('Error creating system template:', error);

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
        error: error instanceof Error ? error.message : 'Failed to create template',
      },
      { status: 500 }
    );
  }
}

export { withSystemAdmin(GET) as GET, withSystemAdmin(POST) as POST };