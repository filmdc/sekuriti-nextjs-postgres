import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import {
  bulkDeleteAssets,
  bulkTagAssets,
  bulkAddAssetsToGroup
} from '@/lib/db/queries-assets';
import { z } from 'zod';

// POST /api/assets/bulk - Bulk operations
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'delete': {
        const schema = z.object({
          assetIds: z.array(z.number()).min(1)
        });

        const { assetIds } = schema.parse(body);
        const deletedAssets = await bulkDeleteAssets(assetIds, user.teamId);

        return NextResponse.json({
          success: true,
          deletedCount: deletedAssets.length
        });
      }

      case 'tag': {
        const schema = z.object({
          assetIds: z.array(z.number()).min(1),
          tagIds: z.array(z.number()).min(1)
        });

        const { assetIds, tagIds } = schema.parse(body);
        await bulkTagAssets(assetIds, tagIds, user.teamId);

        return NextResponse.json({
          success: true,
          message: `Tagged ${assetIds.length} assets with ${tagIds.length} tags`
        });
      }

      case 'addToGroup': {
        const schema = z.object({
          assetIds: z.array(z.number()).min(1),
          groupId: z.number()
        });

        const { assetIds, groupId } = schema.parse(body);
        await bulkAddAssetsToGroup(assetIds, groupId, user.teamId);

        return NextResponse.json({
          success: true,
          message: `Added ${assetIds.length} assets to group`
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}