import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { bulkTagAssets } from '@/lib/db/queries-assets';
import { z } from 'zod';

// POST /api/assets/bulk-tag - Add tags to multiple assets
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const schema = z.object({
      assetIds: z.array(z.number()).min(1, 'At least one asset must be provided'),
      tagIds: z.array(z.number()).min(1, 'At least one tag must be provided'),
      action: z.enum(['add', 'remove']).default('add')
    });

    const { assetIds, tagIds, action } = schema.parse(body);

    if (action === 'add') {
      await bulkTagAssets(assetIds, tagIds, user.teamId);
    } else {
      // For remove action, we need to remove tags from each asset individually
      const { removeTagsFromAsset } = await import('@/lib/db/queries-assets');
      for (const assetId of assetIds) {
        await removeTagsFromAsset(assetId, tagIds);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${action === 'add' ? 'Added' : 'Removed'} ${tagIds.length} tag(s) ${action === 'add' ? 'to' : 'from'} ${assetIds.length} asset(s)` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error bulk tagging assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}