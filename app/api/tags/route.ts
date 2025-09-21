import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getTagsByOrganization, createTag, searchTags, getPopularTags } from '@/lib/db/queries-tags';
import { z } from 'zod';

// GET /api/tags - List or search tags
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const popular = searchParams.get('popular') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let tags;
    if (query) {
      tags = await searchTags(user.teamId, query);
    } else if (popular) {
      tags = await getPopularTags(user.teamId, limit);
    } else {
      tags = await getTagsByOrganization(user.teamId);
    }

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create tag
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const tagSchema = z.object({
      name: z.string().min(1).max(50),
      category: z.enum(['location', 'department', 'criticality', 'compliance', 'incident_type', 'skill', 'custom']).default('custom'),
      color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#6B7280'),
      description: z.string().optional().nullable()
    });

    const validatedData = tagSchema.parse(body);

    const tag = await createTag({
      ...validatedData,
      organizationId: user.teamId
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}