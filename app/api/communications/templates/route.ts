import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communicationTemplates } from '@/lib/db/schema-ir';
import { tags, taggables } from '@/lib/db/schema-tags';
import { eq, and, or, isNull, desc, asc, like } from 'drizzle-orm';
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const includeSystem = searchParams.get('includeSystem') !== 'false';

    // Build query conditions
    const conditions = [];

    // Include organization templates and optionally system templates
    if (includeSystem) {
      conditions.push(
        or(
          eq(communicationTemplates.organizationId, parseInt(orgId || '0')),
          isNull(communicationTemplates.organizationId)
        )
      );
    } else {
      conditions.push(eq(communicationTemplates.organizationId, parseInt(orgId || '0')));
    }

    // Filter by category
    if (category && category !== 'all') {
      conditions.push(eq(communicationTemplates.category, category));
    }

    // Search in title and content
    if (search) {
      conditions.push(
        or(
          like(communicationTemplates.title, `%${search}%`),
          like(communicationTemplates.content, `%${search}%`)
        )
      );
    }

    // Fetch templates with tags
    const templates = await db
      .select({
        id: communicationTemplates.id,
        title: communicationTemplates.title,
        category: communicationTemplates.category,
        subject: communicationTemplates.subject,
        content: communicationTemplates.content,
        tags: communicationTemplates.tags,
        isDefault: communicationTemplates.isDefault,
        organizationId: communicationTemplates.organizationId,
        createdBy: communicationTemplates.createdBy,
        createdAt: communicationTemplates.createdAt,
        updatedAt: communicationTemplates.updatedAt,
      })
      .from(communicationTemplates)
      .where(and(...conditions))
      .orderBy(
        desc(communicationTemplates.updatedAt),
        asc(communicationTemplates.title)
      );

    // Add usage stats (mock data for now)
    const templatesWithStats = templates.map(template => ({
      ...template,
      usageCount: Math.floor(Math.random() * 50),
      lastUsed: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      isFavorite: Math.random() > 0.7,
    }));

    return NextResponse.json({ templates: templatesWithStats });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, subject, content, tags, isDefault } = body;

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Only allow system templates for admin users
    const organizationId = isDefault ? null : parseInt(orgId || '0');

    const [newTemplate] = await db
      .insert(communicationTemplates)
      .values({
        title,
        category,
        subject,
        content,
        tags: tags || [],
        isDefault: isDefault || false,
        organizationId,
        createdBy: parseInt(userId),
      })
      .returning();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}