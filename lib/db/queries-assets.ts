import { desc, and, eq, isNull, like, or, sql, inArray, ne, asc } from 'drizzle-orm';
import { db } from './drizzle';
import { assets } from './schema-ir';
import { tags, taggables, assetGroups, assetGroupMembers } from './schema-tags';
import type { Asset, NewAsset } from './schema-ir';
import type { AssetGroup, Tag } from './schema-tags';

// Asset CRUD operations
export async function getAssets(organizationId: number, filters?: {
  type?: string;
  search?: string;
  mustContact?: boolean;
  criticality?: string;
  tags?: number[];
  groupId?: number;
  view?: 'card' | 'table';
  sortBy?: 'name' | 'type' | 'criticality' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}) {
  let query = db.select({
    asset: assets,
    tags: sql<Tag[]>`
      COALESCE(
        array_agg(
          DISTINCT jsonb_build_object(
            'id', ${tags.id},
            'name', ${tags.name},
            'color', ${tags.color},
            'category', ${tags.category}
          )
        ) FILTER (WHERE ${tags.id} IS NOT NULL),
        '{}'::jsonb[]
      )
    `,
    groups: sql<AssetGroup[]>`
      COALESCE(
        array_agg(
          DISTINCT jsonb_build_object(
            'id', ${assetGroups.id},
            'name', ${assetGroups.name},
            'type', ${assetGroups.type},
            'color', ${assetGroups.color}
          )
        ) FILTER (WHERE ${assetGroups.id} IS NOT NULL),
        '{}'::jsonb[]
      )
    `
  })
  .from(assets)
  .leftJoin(taggables, and(
    eq(taggables.taggableType, 'asset'),
    eq(taggables.taggableId, assets.id)
  ))
  .leftJoin(tags, eq(taggables.tagId, tags.id))
  .leftJoin(assetGroupMembers, eq(assetGroupMembers.assetId, assets.id))
  .leftJoin(assetGroups, eq(assetGroupMembers.assetGroupId, assetGroups.id))
  .where(
    and(
      eq(assets.organizationId, organizationId),
      isNull(assets.deletedAt)
    )
  )
  .groupBy(assets.id);

  // Apply filters
  const conditions: any[] = [
    eq(assets.organizationId, organizationId),
    isNull(assets.deletedAt)
  ];

  if (filters?.type) {
    conditions.push(eq(assets.type, filters.type as any));
  }

  if (filters?.criticality) {
    conditions.push(eq(assets.criticality, filters.criticality));
  }

  if (filters?.mustContact !== undefined) {
    conditions.push(eq(assets.mustContact, filters.mustContact));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(assets.name, `%${filters.search}%`),
        like(assets.description, `%${filters.search}%`),
        like(assets.vendor, `%${filters.search}%`),
        like(assets.identifier, `%${filters.search}%`)
      )
    );
  }

  // Filter by tags
  if (filters?.tags && filters.tags.length > 0) {
    const assetsWithTags = await db
      .selectDistinct({ assetId: taggables.taggableId })
      .from(taggables)
      .where(
        and(
          eq(taggables.taggableType, 'asset'),
          inArray(taggables.tagId, filters.tags)
        )
      );

    const assetIds = assetsWithTags.map(a => a.assetId);
    if (assetIds.length > 0) {
      conditions.push(inArray(assets.id, assetIds));
    } else {
      // No assets match the tags
      return [];
    }
  }

  // Filter by group
  if (filters?.groupId) {
    const assetsInGroup = await db
      .selectDistinct({ assetId: assetGroupMembers.assetId })
      .from(assetGroupMembers)
      .where(eq(assetGroupMembers.assetGroupId, filters.groupId));

    const assetIds = assetsInGroup.map(a => a.assetId);
    if (assetIds.length > 0) {
      conditions.push(inArray(assets.id, assetIds));
    } else {
      return [];
    }
  }

  query = query.where(and(...conditions));

  // Apply sorting
  const sortColumn = filters?.sortBy || 'created';
  const sortDirection = filters?.sortOrder || 'desc';

  switch (sortColumn) {
    case 'name':
      query = sortDirection === 'asc'
        ? query.orderBy(asc(assets.name))
        : query.orderBy(desc(assets.name));
      break;
    case 'type':
      query = sortDirection === 'asc'
        ? query.orderBy(asc(assets.type))
        : query.orderBy(desc(assets.type));
      break;
    case 'criticality':
      query = sortDirection === 'asc'
        ? query.orderBy(asc(assets.criticality))
        : query.orderBy(desc(assets.criticality));
      break;
    case 'updated':
      query = sortDirection === 'asc'
        ? query.orderBy(asc(assets.updatedAt))
        : query.orderBy(desc(assets.updatedAt));
      break;
    default:
      query = sortDirection === 'asc'
        ? query.orderBy(asc(assets.createdAt))
        : query.orderBy(desc(assets.createdAt));
  }

  return query;
}

export async function getAssetById(id: number, organizationId: number) {
  const result = await db
    .select({
      asset: assets,
      tags: sql<Tag[]>`
        COALESCE(
          array_agg(
            DISTINCT jsonb_build_object(
              'id', ${tags.id},
              'name', ${tags.name},
              'color', ${tags.color},
              'category', ${tags.category}
            )
          ) FILTER (WHERE ${tags.id} IS NOT NULL),
          '{}'::jsonb[]
        )
      `,
      groups: sql<AssetGroup[]>`
        COALESCE(
          array_agg(
            DISTINCT jsonb_build_object(
              'id', ${assetGroups.id},
              'name', ${assetGroups.name},
              'type', ${assetGroups.type},
              'icon', ${assetGroups.icon},
              'color', ${assetGroups.color}
            )
          ) FILTER (WHERE ${assetGroups.id} IS NOT NULL),
          '{}'::jsonb[]
        )
      `
    })
    .from(assets)
    .leftJoin(taggables, and(
      eq(taggables.taggableType, 'asset'),
      eq(taggables.taggableId, assets.id)
    ))
    .leftJoin(tags, eq(taggables.tagId, tags.id))
    .leftJoin(assetGroupMembers, eq(assetGroupMembers.assetId, assets.id))
    .leftJoin(assetGroups, eq(assetGroupMembers.assetGroupId, assetGroups.id))
    .where(
      and(
        eq(assets.id, id),
        eq(assets.organizationId, organizationId),
        isNull(assets.deletedAt)
      )
    )
    .groupBy(assets.id)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createAsset(data: NewAsset) {
  const [newAsset] = await db.insert(assets).values(data).returning();
  return newAsset;
}

export async function updateAsset(id: number, organizationId: number, data: Partial<NewAsset>) {
  const [updatedAsset] = await db
    .update(assets)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(assets.id, id),
        eq(assets.organizationId, organizationId)
      )
    )
    .returning();

  return updatedAsset;
}

export async function deleteAsset(id: number, organizationId: number) {
  const [deletedAsset] = await db
    .update(assets)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date()
    })
    .where(
      and(
        eq(assets.id, id),
        eq(assets.organizationId, organizationId),
        isNull(assets.deletedAt)
      )
    )
    .returning();

  return deletedAsset;
}

export async function bulkDeleteAssets(ids: number[], organizationId: number) {
  const deletedAssets = await db
    .update(assets)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date()
    })
    .where(
      and(
        inArray(assets.id, ids),
        eq(assets.organizationId, organizationId),
        isNull(assets.deletedAt)
      )
    )
    .returning();

  return deletedAssets;
}

// Tag operations for assets
export async function addTagsToAsset(assetId: number, tagIds: number[], organizationId: number) {
  const taggablesToInsert = tagIds.map(tagId => ({
    tagId,
    taggableType: 'asset' as const,
    taggableId: assetId,
    organizationId
  }));

  await db.insert(taggables).values(taggablesToInsert).onConflictDoNothing();

  // Update tag usage counts
  await db
    .update(tags)
    .set({
      usageCount: sql`${tags.usageCount} + 1`,
      updatedAt: new Date()
    })
    .where(inArray(tags.id, tagIds));
}

export async function removeTagsFromAsset(assetId: number, tagIds: number[]) {
  await db
    .delete(taggables)
    .where(
      and(
        eq(taggables.taggableType, 'asset'),
        eq(taggables.taggableId, assetId),
        inArray(taggables.tagId, tagIds)
      )
    );

  // Update tag usage counts
  await db
    .update(tags)
    .set({
      usageCount: sql`GREATEST(${tags.usageCount} - 1, 0)`,
      updatedAt: new Date()
    })
    .where(inArray(tags.id, tagIds));
}

export async function bulkTagAssets(assetIds: number[], tagIds: number[], organizationId: number) {
  const taggablesToInsert: any[] = [];

  for (const assetId of assetIds) {
    for (const tagId of tagIds) {
      taggablesToInsert.push({
        tagId,
        taggableType: 'asset',
        taggableId: assetId,
        organizationId
      });
    }
  }

  await db.insert(taggables).values(taggablesToInsert).onConflictDoNothing();

  // Update tag usage counts
  const affectedRows = taggablesToInsert.length;
  await db
    .update(tags)
    .set({
      usageCount: sql`${tags.usageCount} + ${affectedRows}`,
      updatedAt: new Date()
    })
    .where(inArray(tags.id, tagIds));
}

// Group operations for assets
export async function addAssetToGroup(assetId: number, groupId: number, addedBy: number) {
  await db
    .insert(assetGroupMembers)
    .values({
      assetId,
      assetGroupId: groupId,
      addedBy
    })
    .onConflictDoNothing();

  // Update group member count
  await db
    .update(assetGroups)
    .set({
      memberCount: sql`${assetGroups.memberCount} + 1`,
      updatedAt: new Date()
    })
    .where(eq(assetGroups.id, groupId));
}

export async function removeAssetFromGroup(assetId: number, groupId: number) {
  await db
    .delete(assetGroupMembers)
    .where(
      and(
        eq(assetGroupMembers.assetId, assetId),
        eq(assetGroupMembers.assetGroupId, groupId)
      )
    );

  // Update group member count
  await db
    .update(assetGroups)
    .set({
      memberCount: sql`GREATEST(${assetGroups.memberCount} - 1, 0)`,
      updatedAt: new Date()
    })
    .where(eq(assetGroups.id, groupId));
}

export async function bulkAddAssetsToGroup(assetIds: number[], groupId: number, addedBy: number) {
  const membersToInsert = assetIds.map(assetId => ({
    assetId,
    assetGroupId: groupId,
    addedBy
  }));

  await db.insert(assetGroupMembers).values(membersToInsert).onConflictDoNothing();

  // Update group member count
  await db
    .update(assetGroups)
    .set({
      memberCount: sql`${assetGroups.memberCount} + ${assetIds.length}`,
      updatedAt: new Date()
    })
    .where(eq(assetGroups.id, groupId));
}

// Search with autocomplete
export async function searchAssets(organizationId: number, query: string, limit = 10) {
  return db
    .select({
      id: assets.id,
      name: assets.name,
      type: assets.type,
      identifier: assets.identifier,
      criticality: assets.criticality
    })
    .from(assets)
    .where(
      and(
        eq(assets.organizationId, organizationId),
        isNull(assets.deletedAt),
        or(
          like(assets.name, `%${query}%`),
          like(assets.identifier, `%${query}%`)
        )
      )
    )
    .limit(limit);
}

// Export assets
export async function exportAssets(organizationId: number, format: 'csv' | 'json' = 'csv') {
  const assetsData = await db
    .select()
    .from(assets)
    .where(
      and(
        eq(assets.organizationId, organizationId),
        isNull(assets.deletedAt)
      )
    )
    .orderBy(assets.name);

  if (format === 'json') {
    return JSON.stringify(assetsData, null, 2);
  }

  // CSV export
  const headers = [
    'Name',
    'Type',
    'Description',
    'Identifier',
    'Criticality',
    'Primary Contact',
    'Primary Contact Email',
    'Primary Contact Phone',
    'Vendor',
    'Location',
    'Purchase Date',
    'Expiry Date',
    'Value'
  ];

  const rows = assetsData.map(asset => [
    asset.name,
    asset.type,
    asset.description || '',
    asset.identifier || '',
    asset.criticality || '',
    asset.primaryContact || '',
    asset.primaryContactEmail || '',
    asset.primaryContactPhone || '',
    asset.vendor || '',
    asset.location || '',
    asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '',
    asset.expiryDate ? new Date(asset.expiryDate).toLocaleDateString() : '',
    asset.value || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

// Statistics
export async function getAssetStatistics(organizationId: number) {
  const [
    totalCount,
    byType,
    byCriticality,
    mustContactCount,
    expiringCount
  ] = await Promise.all([
    // Total assets
    db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(
        and(
          eq(assets.organizationId, organizationId),
          isNull(assets.deletedAt)
        )
      ),

    // Assets by type
    db
      .select({
        type: assets.type,
        count: sql<number>`count(*)`
      })
      .from(assets)
      .where(
        and(
          eq(assets.organizationId, organizationId),
          isNull(assets.deletedAt)
        )
      )
      .groupBy(assets.type),

    // Assets by criticality
    db
      .select({
        criticality: assets.criticality,
        count: sql<number>`count(*)`
      })
      .from(assets)
      .where(
        and(
          eq(assets.organizationId, organizationId),
          isNull(assets.deletedAt)
        )
      )
      .groupBy(assets.criticality),

    // Must contact assets
    db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(
        and(
          eq(assets.organizationId, organizationId),
          isNull(assets.deletedAt),
          eq(assets.mustContact, true)
        )
      ),

    // Expiring assets (within 30 days)
    db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(
        and(
          eq(assets.organizationId, organizationId),
          isNull(assets.deletedAt),
          sql`${assets.expiryDate} <= NOW() + INTERVAL '30 days'`,
          sql`${assets.expiryDate} >= NOW()`
        )
      )
  ]);

  return {
    total: totalCount[0]?.count || 0,
    byType,
    byCriticality,
    mustContact: mustContactCount[0]?.count || 0,
    expiringCount: expiringCount[0]?.count || 0
  };
}