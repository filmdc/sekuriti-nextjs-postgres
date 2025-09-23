import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import {
  getSystemDropdowns,
  createSystemDropdown,
} from '@/lib/db/queries-content';
import { cache, CacheInvalidation } from '@/lib/cache';
import { CacheKeys, CACHE_TTL } from '@/lib/types/api';

const createDropdownSchema = z.object({
  category: z.enum([
    'asset_types',
    'criticality_levels',
    'incident_classifications',
    'severity_levels',
    'departments',
    'locations',
    'vendor_types',
    'compliance_frameworks',
    'custom'
  ]),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    metadata: z.record(z.any()).optional(),
  })).min(1),
  allowCustomValues: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const listParamsSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'category', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = listParamsSchema.parse(Object.fromEntries(searchParams));

    // Try to get from cache first
    const cacheKey = CacheKeys.systemDropdowns(params.category);
    const cached = cache.get(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        pagination: cached.pagination,
      });
    }

    // Fetch from database
    const result = await getSystemDropdowns({
      ...params,
      filters: {
        category: params.category,
        isActive: params.isActive,
      },
    });

    // Cache the result
    cache.set(cacheKey, result, CACHE_TTL.SYSTEM_DROPDOWNS);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching system dropdowns:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dropdowns',
      },
      { status: 400 }
    );
  }
}

async function POST(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const data = createDropdownSchema.parse(body);

    const dropdown = await createSystemDropdown({
      ...data,
      allowCustomValues: data.allowCustomValues || false,
      sortOrder: data.sortOrder || 0,
      isActive: true,
      createdBy: context.user.id,
      updatedBy: context.user.id,
    });

    // Invalidate cache
    CacheInvalidation.invalidateSystemDropdowns(data.category);
    CacheInvalidation.invalidateSystemDropdowns(); // Invalidate 'all' cache

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'CREATE_SYSTEM_DROPDOWN',
      entityType: 'system_dropdown',
      entityId: dropdown.id,
      changes: data,
      metadata: {
        dropdownName: data.name,
        category: data.category,
        optionCount: data.options.length,
      },
    });

    return NextResponse.json({
      success: true,
      data: dropdown,
      message: 'Dropdown created successfully',
    });
  } catch (error) {
    console.error('Error creating system dropdown:', error);

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
        error: error instanceof Error ? error.message : 'Failed to create dropdown',
      },
      { status: 500 }
    );
  }
}

export { withSystemAdmin(GET) as GET, withSystemAdmin(POST) as POST };