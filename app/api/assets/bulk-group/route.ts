import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { bulkAddAssetsToGroup } from '@/lib/db/queries-assets';
import { z } from 'zod';

// POST /api/assets/bulk-group - Add multiple assets to a group
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const schema = z.object({
      assetIds: z.array(z.number()).min(1, 'At least one asset must be provided'),
      groupId: z.number()
    });

    const { assetIds, groupId } = schema.parse(body);

    await bulkAddAssetsToGroup(assetIds, groupId, user.teamId);

    return NextResponse.json({ 
      success: true, 
      message: `Added ${assetIds.length} asset(s) to group successfully` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error bulk adding assets to group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}