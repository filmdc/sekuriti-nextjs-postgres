import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import {
  getSystemDropdownById,
  updateSystemDropdown,
  deleteSystemDropdown,
} from '@/lib/db/queries-content';
import { CacheInvalidation } from '@/lib/cache';

const updateDropdownSchema = z.object({
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
  ]).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    metadata: z.record(z.any()).optional(),
  })).min(1).optional(),
  isActive: z.boolean().optional(),
  allowCustomValues: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid dropdown ID' },
        { status: 400 }
      );
    }

    const dropdown = await getSystemDropdownById(id);

    if (!dropdown) {
      return NextResponse.json(
        { success: false, error: 'Dropdown not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dropdown,
    });
  } catch (error) {
    console.error('Error fetching system dropdown:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dropdown',
      },
      { status: 500 }
    );
  }
}

async function PUT(
  request: NextRequest,
  { params, context }: { params: { id: string }; context: any }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid dropdown ID' },
        { status: 400 }
      );
    }

    // Get the existing dropdown for logging
    const existingDropdown = await getSystemDropdownById(id);
    if (!existingDropdown) {
      return NextResponse.json(
        { success: false, error: 'Dropdown not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateDropdownSchema.parse(body);

    const updatedDropdown = await updateSystemDropdown(id, {
      ...data,
      updatedBy: context.user.id,
    });

    if (!updatedDropdown) {
      return NextResponse.json(
        { success: false, error: 'Dropdown not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    CacheInvalidation.invalidateSystemDropdowns(existingDropdown.category);
    if (data.category && data.category !== existingDropdown.category) {
      CacheInvalidation.invalidateSystemDropdowns(data.category);
    }
    CacheInvalidation.invalidateSystemDropdowns(); // Invalidate 'all' cache

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'UPDATE_SYSTEM_DROPDOWN',
      entityType: 'system_dropdown',
      entityId: id,
      changes: data,
      metadata: {
        dropdownName: updatedDropdown.name,
        previousCategory: existingDropdown.category,
        newCategory: data.category || existingDropdown.category,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDropdown,
      message: 'Dropdown updated successfully',
    });
  } catch (error) {
    console.error('Error updating system dropdown:', error);

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
        error: error instanceof Error ? error.message : 'Failed to update dropdown',
      },
      { status: 500 }
    );
  }
}

async function DELETE(
  request: NextRequest,
  { params, context }: { params: { id: string }; context: any }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid dropdown ID' },
        { status: 400 }
      );
    }

    // Get the existing dropdown for logging
    const existingDropdown = await getSystemDropdownById(id);
    if (!existingDropdown) {
      return NextResponse.json(
        { success: false, error: 'Dropdown not found' },
        { status: 404 }
      );
    }

    await deleteSystemDropdown(id);

    // Invalidate cache
    CacheInvalidation.invalidateSystemDropdowns(existingDropdown.category);
    CacheInvalidation.invalidateSystemDropdowns(); // Invalidate 'all' cache

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'DELETE_SYSTEM_DROPDOWN',
      entityType: 'system_dropdown',
      entityId: id,
      metadata: {
        dropdownName: existingDropdown.name,
        category: existingDropdown.category,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Dropdown deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting system dropdown:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete dropdown',
      },
      { status: 500 }
    );
  }
}

export {
  withSystemAdmin(GET) as GET,
  withSystemAdmin(PUT) as PUT,
  withSystemAdmin(DELETE) as DELETE,
};