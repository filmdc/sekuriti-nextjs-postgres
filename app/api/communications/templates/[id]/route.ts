import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communicationTemplates } from '@/lib/db/schema-ir';
import { eq, and, or, isNull } from 'drizzle-orm';
import { auth } from '@clerk/nextjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    const [template] = await db
      .select()
      .from(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.id, templateId),
          or(
            eq(communicationTemplates.organizationId, parseInt(orgId || '0')),
            isNull(communicationTemplates.organizationId)
          )
        )
      )
      .limit(1);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Add mock usage stats
    const templateWithStats = {
      ...template,
      usageCount: Math.floor(Math.random() * 50),
      lastUsed: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      isFavorite: Math.random() > 0.7,
    };

    return NextResponse.json(templateWithStats);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, category, subject, content, tags, isDefault, versionNotes } = body;

    // Check if template exists and user has permission to edit
    const [existingTemplate] = await db
      .select()
      .from(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.id, templateId),
          or(
            eq(communicationTemplates.organizationId, parseInt(orgId || '0')),
            and(
              isNull(communicationTemplates.organizationId),
              // Only admins can edit system templates
              // Add admin check here
            )
          )
        )
      )
      .limit(1);

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    // Update template
    const [updatedTemplate] = await db
      .update(communicationTemplates)
      .set({
        title,
        category,
        subject,
        content,
        tags: tags || [],
        isDefault: isDefault || false,
        updatedAt: new Date(),
      })
      .where(eq(communicationTemplates.id, templateId))
      .returning();

    // TODO: Store version history if versionNotes provided
    if (versionNotes) {
      console.log('Version notes:', versionNotes);
      // Store in a version history table
    }

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    // Check if template exists and user has permission to delete
    const [existingTemplate] = await db
      .select()
      .from(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.id, templateId),
          eq(communicationTemplates.organizationId, parseInt(orgId || '0')),
          // Don't allow deletion of system templates
          eq(communicationTemplates.isDefault, false)
        )
      )
      .limit(1);

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found or cannot be deleted' },
        { status: 404 }
      );
    }

    await db
      .delete(communicationTemplates)
      .where(eq(communicationTemplates.id, templateId));

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}