import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communicationTemplates } from '@/lib/db/schema-ir';
import { eq, and, or, isNull } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    // Fetch the original template
    const [originalTemplate] = await db
      .select()
      .from(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.id, templateId),
          or(
            eq(communicationTemplates.organizationId, user.teamId),
            isNull(communicationTemplates.organizationId)
          )
        )
      )
      .limit(1);

    if (!originalTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create a copy of the template
    const [clonedTemplate] = await db
      .insert(communicationTemplates)
      .values({
        title: `${originalTemplate.title} (Copy)`,
        category: originalTemplate.category,
        subject: originalTemplate.subject,
        content: originalTemplate.content,
        tags: originalTemplate.tags || [],
        isDefault: false, // Cloned templates are never default
        organizationId: user.teamId, // Always assign to user's org
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json(clonedTemplate, { status: 201 });
  } catch (error) {
    console.error('Error cloning template:', error);
    return NextResponse.json(
      { error: 'Failed to clone template' },
      { status: 500 }
    );
  }
}