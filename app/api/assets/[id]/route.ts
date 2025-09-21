import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getAssetById, updateAsset, deleteAsset } from '@/lib/db/queries-assets';
import { z } from 'zod';

// GET /api/assets/:id - Get single asset
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetId = parseInt(params.id);
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    const asset = await getAssetById(assetId, user.teamId);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/assets/:id - Update asset
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetId = parseInt(params.id);
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    const body = await request.json();

    const assetSchema = z.object({
      name: z.string().min(1).max(255).optional(),
      type: z.enum(['hardware', 'software', 'service', 'data', 'personnel', 'facility', 'vendor', 'contract']).optional(),
      description: z.string().optional().nullable(),
      identifier: z.string().optional().nullable(),
      primaryContact: z.string().optional().nullable(),
      primaryContactEmail: z.string().email().optional().nullable(),
      primaryContactPhone: z.string().optional().nullable(),
      secondaryContact: z.string().optional().nullable(),
      secondaryContactEmail: z.string().email().optional().nullable(),
      secondaryContactPhone: z.string().optional().nullable(),
      vendor: z.string().optional().nullable(),
      purchaseDate: z.string().optional().nullable(),
      expiryDate: z.string().optional().nullable(),
      value: z.string().optional().nullable(),
      mustContact: z.boolean().optional(),
      criticality: z.enum(['low', 'medium', 'high', 'critical']).optional().nullable(),
      location: z.string().optional().nullable(),
      metadata: z.record(z.any()).optional().nullable()
    });

    const validatedData = assetSchema.parse(body);

    const updatedAsset = await updateAsset(assetId, user.teamId, {
      ...validatedData,
      purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
      expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined
    });

    if (!updatedAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAsset);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/assets/:id - Delete asset
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
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    const deletedAsset = await deleteAsset(assetId, user.teamId);
    if (!deletedAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}