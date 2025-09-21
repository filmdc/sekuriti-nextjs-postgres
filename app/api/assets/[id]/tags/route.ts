import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { 
  addTagsToAsset, 
  removeTagsFromAsset,
  getAssetById 
} from '@/lib/db/queries-assets';
import { z } from 'zod';

// POST /api/assets/[id]/tags - Add tags to asset
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetId = parseInt(params.id);
    const body = await request.json();

    const schema = z.object({
      tagIds: z.array(z.number()).min(1, 'At least one tag must be provided')
    });

    const { tagIds } = schema.parse(body);

    // Verify asset exists and belongs to the organization
    const asset = await getAssetById(assetId, user.teamId);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    await addTagsToAsset(assetId, tagIds, user.teamId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error adding tags to asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/assets/[id]/tags - Remove tags from asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetId = parseInt(params.id);
    const body = await request.json();

    const schema = z.object({
      tagIds: z.array(z.number()).min(1, 'At least one tag must be provided')
    });

    const { tagIds } = schema.parse(body);

    // Verify asset exists and belongs to the organization
    const asset = await getAssetById(assetId, user.teamId);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    await removeTagsFromAsset(assetId, tagIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error removing tags from asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}