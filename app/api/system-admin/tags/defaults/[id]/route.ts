import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import {
  getDefaultTagById,
  updateDefaultTag,
  deleteDefaultTag,
} from '@/lib/db/queries-content';
import { CacheInvalidation } from '@/lib/cache';

const updateDefaultTagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
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
  })).min(1).optional(),
  entityTypes: z.array(z.enum([
    'asset',
    'incident',
    'runbook',
    'communication',
    'exercise'
  ])).min(1).optional(),
  isActive: z.boolean().optional(),
  isRequired: z.boolean().optional(),
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
        { success: false, error: 'Invalid tag set ID' },
        { status: 400 }
      );
    }

    const defaultTag = await getDefaultTagById(id);

    if (!defaultTag) {
      return NextResponse.json(
        { success: false, error: 'Default tag set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: defaultTag,
    });
  } catch (error) {
    console.error('Error fetching default tag set:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch default tag set',
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
        { success: false, error: 'Invalid tag set ID' },
        { status: 400 }
      );
    }

    // Get the existing tag set for logging
    const existingTagSet = await getDefaultTagById(id);
    if (!existingTagSet) {
      return NextResponse.json(
        { success: false, error: 'Default tag set not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateDefaultTagSchema.parse(body);

    const updatedTagSet = await updateDefaultTag(id, {
      ...data,
      updatedBy: context.user.id,
    });

    if (!updatedTagSet) {
      return NextResponse.json(
        { success: false, error: 'Default tag set not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    CacheInvalidation.invalidateDefaultTags();

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'UPDATE_DEFAULT_TAG_SET',
      entityType: 'default_tag_set',
      entityId: id,
      changes: data,
      metadata: {
        tagSetName: updatedTagSet.name,
        previousRequiredStatus: existingTagSet.isRequired,
        newRequiredStatus: data.isRequired !== undefined ? data.isRequired : existingTagSet.isRequired,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTagSet,
      message: 'Default tag set updated successfully',
    });
  } catch (error) {
    console.error('Error updating default tag set:', error);

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
        error: error instanceof Error ? error.message : 'Failed to update default tag set',
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
        { success: false, error: 'Invalid tag set ID' },
        { status: 400 }
      );
    }

    // Get the existing tag set for logging
    const existingTagSet = await getDefaultTagById(id);
    if (!existingTagSet) {
      return NextResponse.json(
        { success: false, error: 'Default tag set not found' },
        { status: 404 }
      );
    }

    await deleteDefaultTag(id);

    // Invalidate cache
    CacheInvalidation.invalidateDefaultTags();

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'DELETE_DEFAULT_TAG_SET',
      entityType: 'default_tag_set',
      entityId: id,
      metadata: {
        tagSetName: existingTagSet.name,
        wasRequired: existingTagSet.isRequired,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Default tag set deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting default tag set:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete default tag set',
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