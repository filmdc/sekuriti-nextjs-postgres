import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { tagTemplates } from '@/lib/db/schema-tags';
import { eq, or, isNull } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const memberRecord = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organizationId = memberRecord[0].teamId;

    // Fetch tag templates (both organization-specific and system templates)
    const templates = await db
      .select()
      .from(tagTemplates)
      .where(
        or(
          eq(tagTemplates.organizationId, organizationId),
          isNull(tagTemplates.organizationId)
        )
      );

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching tag templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag templates' },
      { status: 500 }
    );
  }
}