import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import {
  getSystemTemplateById,
  updateSystemTemplate,
  deleteSystemTemplate,
} from '@/lib/db/queries-content';
import { CacheInvalidation } from '@/lib/cache';

const updateTemplateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  category: z.enum([
    'incident_response',
    'communication',
    'runbook',
    'training',
    'compliance',
    'custom'
  ]).optional(),
  description: z.string().optional(),
  content: z.string().min(1).optional(),
  variables: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    required: z.boolean().optional(),
    defaultValue: z.any().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  version: z.string().optional(),
});

async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const template = await getSystemTemplateById(id);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error fetching system template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch template',
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
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    // Get the existing template for logging
    const existingTemplate = await getSystemTemplateById(id);
    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateTemplateSchema.parse(body);

    const updatedTemplate = await updateSystemTemplate(id, {
      ...data,
      updatedBy: context.user.id,
    });

    if (!updatedTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Invalidate cache
    CacheInvalidation.invalidateSystemTemplates(existingTemplate.category);
    if (data.category && data.category !== existingTemplate.category) {
      CacheInvalidation.invalidateSystemTemplates(data.category);
    }
    CacheInvalidation.invalidateSystemTemplates(); // Invalidate 'all' cache

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'UPDATE_SYSTEM_TEMPLATE',
      entityType: 'system_template',
      entityId: id,
      changes: data,
      metadata: {
        templateTitle: updatedTemplate.title,
        previousCategory: existingTemplate.category,
        newCategory: data.category || existingTemplate.category,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('Error updating system template:', error);

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
        error: error instanceof Error ? error.message : 'Failed to update template',
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
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    // Get the existing template for logging
    const existingTemplate = await getSystemTemplateById(id);
    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    await deleteSystemTemplate(id);

    // Invalidate cache
    CacheInvalidation.invalidateSystemTemplates(existingTemplate.category);
    CacheInvalidation.invalidateSystemTemplates(); // Invalidate 'all' cache

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: 'DELETE_SYSTEM_TEMPLATE',
      entityType: 'system_template',
      entityId: id,
      metadata: {
        templateTitle: existingTemplate.title,
        category: existingTemplate.category,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting system template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template',
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