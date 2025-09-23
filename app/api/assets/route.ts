import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getAssets, createAsset, exportAssets } from '@/lib/db/queries-assets';
import { z } from 'zod';
import { enforceQuota, updateResourceCount } from '@/lib/middleware/quota-enforcement';
import { QuotaExceededError } from '@/lib/types/api-responses';

// GET /api/assets - List assets
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      type: searchParams.get('type') || undefined,
      search: searchParams.get('search') || undefined,
      criticality: searchParams.get('criticality') || undefined,
      tags: searchParams.get('tags')
        ? searchParams.get('tags')!.split(',').map(Number)
        : undefined,
      groupId: searchParams.get('groupId')
        ? parseInt(searchParams.get('groupId')!)
        : undefined,
      view: searchParams.get('view') as 'card' | 'table' | undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' | undefined
    };

    const assets = await getAssets(user.teamId, filters);

    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/assets - Create asset
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const assetSchema = z.object({
      name: z.string().min(1).max(255),
      type: z.enum(['hardware', 'software', 'service', 'data', 'personnel', 'facility', 'vendor', 'contract']),
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
      mustContact: z.boolean().default(false),
      criticality: z.enum(['low', 'medium', 'high', 'critical']).optional().nullable(),
      location: z.string().optional().nullable(),
      metadata: z.record(z.any()).optional().nullable()
    });

    const validatedData = assetSchema.parse(body);

    // Check quota before creating asset
    try {
      await enforceQuota(user.teamId, 'assets', 1);
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        return NextResponse.json(
          {
            error: error.message,
            quotaExceeded: true,
            resourceType: error.resourceType,
            current: error.current,
            limit: error.limit,
            upgradeUrl: error.upgradeUrl
          },
          { status: 402 }
        );
      }
      throw error;
    }

    const asset = await createAsset({
      ...validatedData,
      organizationId: user.teamId,
      purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
      expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}