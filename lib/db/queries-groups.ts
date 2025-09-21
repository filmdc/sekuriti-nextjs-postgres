import { desc, and, eq, isNull, like, or, sql, asc } from 'drizzle-orm';
import { db } from './drizzle';
import { assetGroups, assetGroupMembers } from './schema-tags';
import { assets } from './schema-ir';
import type { AssetGroup, NewAssetGroup } from './schema-tags';

// Get all asset groups with hierarchy
export async function getAssetGroups(organizationId: number) {
  const groups = await db
    .select()
    .from(assetGroups)
    .where(eq(assetGroups.organizationId, organizationId))
    .orderBy(asc(assetGroups.sortOrder), asc(assetGroups.name));

  // Build hierarchy
  const groupMap = new Map<number, any>();
  const rootGroups: any[] = [];

  groups.forEach(group => {
    const groupWithChildren = { ...group, children: [] };
    groupMap.set(group.id, groupWithChildren);
  });

  groups.forEach(group => {
    if (group.parentGroupId) {
      const parent = groupMap.get(group.parentGroupId);
      if (parent) {
        parent.children.push(groupMap.get(group.id));
      }
    } else {
      rootGroups.push(groupMap.get(group.id));
    }
  });

  return rootGroups;
}

// Get flat list of groups
export async function getAssetGroupsFlat(organizationId: number) {
  return db
    .select()
    .from(assetGroups)
    .where(eq(assetGroups.organizationId, organizationId))
    .orderBy(asc(assetGroups.sortOrder), asc(assetGroups.name));
}

// Get single group with members
export async function getAssetGroupById(id: number, organizationId: number) {
  const [group] = await db
    .select()
    .from(assetGroups)
    .where(
      and(
        eq(assetGroups.id, id),
        eq(assetGroups.organizationId, organizationId)
      )
    )
    .limit(1);

  if (!group) return null;

  // Get members
  const members = await db
    .select({
      asset: assets,
      membership: assetGroupMembers
    })
    .from(assetGroupMembers)
    .innerJoin(assets, eq(assetGroupMembers.assetId, assets.id))
    .where(
      and(
        eq(assetGroupMembers.assetGroupId, id),
        isNull(assets.deletedAt)
      )
    )
    .orderBy(assets.name);

  // Get child groups
  const children = await db
    .select()
    .from(assetGroups)
    .where(eq(assetGroups.parentGroupId, id))
    .orderBy(asc(assetGroups.sortOrder), asc(assetGroups.name));

  return {
    ...group,
    members,
    children
  };
}

// Create a new asset group
export async function createAssetGroup(data: NewAssetGroup) {
  const [newGroup] = await db
    .insert(assetGroups)
    .values(data)
    .returning();

  return newGroup;
}

// Update an asset group
export async function updateAssetGroup(
  id: number,
  organizationId: number,
  data: Partial<NewAssetGroup>
) {
  const [updatedGroup] = await db
    .update(assetGroups)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(assetGroups.id, id),
        eq(assetGroups.organizationId, organizationId)
      )
    )
    .returning();

  return updatedGroup;
}

// Delete an asset group
export async function deleteAssetGroup(id: number, organizationId: number) {
  // First, remove all members from the group
  await db
    .delete(assetGroupMembers)
    .where(eq(assetGroupMembers.assetGroupId, id));

  // Update child groups to have no parent
  await db
    .update(assetGroups)
    .set({
      parentGroupId: null,
      updatedAt: new Date()
    })
    .where(eq(assetGroups.parentGroupId, id));

  // Delete the group
  const [deletedGroup] = await db
    .delete(assetGroups)
    .where(
      and(
        eq(assetGroups.id, id),
        eq(assetGroups.organizationId, organizationId)
      )
    )
    .returning();

  return deletedGroup;
}

// Move assets between groups
export async function moveAssetsBetweenGroups(
  assetIds: number[],
  fromGroupId: number | null,
  toGroupId: number,
  userId: number
) {
  // Remove from old group if specified
  if (fromGroupId) {
    await db
      .delete(assetGroupMembers)
      .where(
        and(
          eq(assetGroupMembers.assetGroupId, fromGroupId),
          sql`${assetGroupMembers.assetId} = ANY(${assetIds})`
        )
      );

    // Update old group member count
    await db
      .update(assetGroups)
      .set({
        memberCount: sql`GREATEST(${assetGroups.memberCount} - ${assetIds.length}, 0)`,
        updatedAt: new Date()
      })
      .where(eq(assetGroups.id, fromGroupId));
  }

  // Add to new group
  const membersToInsert = assetIds.map(assetId => ({
    assetId,
    assetGroupId: toGroupId,
    addedBy: userId
  }));

  await db
    .insert(assetGroupMembers)
    .values(membersToInsert)
    .onConflictDoNothing();

  // Update new group member count
  await db
    .update(assetGroups)
    .set({
      memberCount: sql`${assetGroups.memberCount} + ${assetIds.length}`,
      updatedAt: new Date()
    })
    .where(eq(assetGroups.id, toGroupId));
}

// Get group path (breadcrumb)
export async function getGroupPath(groupId: number): Promise<AssetGroup[]> {
  const path: AssetGroup[] = [];
  let currentId: number | null = groupId;

  while (currentId) {
    const [group] = await db
      .select()
      .from(assetGroups)
      .where(eq(assetGroups.id, currentId))
      .limit(1);

    if (!group) break;

    path.unshift(group);
    currentId = group.parentGroupId;
  }

  return path;
}

// Apply dynamic group rules
export async function applyDynamicGroupRules(groupId: number, organizationId: number) {
  const [group] = await db
    .select()
    .from(assetGroups)
    .where(
      and(
        eq(assetGroups.id, groupId),
        eq(assetGroups.organizationId, organizationId),
        eq(assetGroups.isDynamic, true)
      )
    )
    .limit(1);

  if (!group || !group.rules) return;

  const rules = group.rules as any;

  // Build query based on rules
  let query = db.select({ id: assets.id }).from(assets).where(
    and(
      eq(assets.organizationId, organizationId),
      isNull(assets.deletedAt)
    )
  );

  // Apply type filter
  if (rules.assetType) {
    query = query.where(eq(assets.type, rules.assetType));
  }

  // Apply criticality filter
  if (rules.criticality) {
    query = query.where(eq(assets.criticality, rules.criticality));
  }

  // Apply must contact filter
  if (rules.mustContact !== undefined) {
    query = query.where(eq(assets.mustContact, rules.mustContact));
  }

  const matchingAssets = await query;

  // Clear existing members
  await db
    .delete(assetGroupMembers)
    .where(eq(assetGroupMembers.assetGroupId, groupId));

  // Add matching assets
  if (matchingAssets.length > 0) {
    const membersToInsert = matchingAssets.map(asset => ({
      assetId: asset.id,
      assetGroupId: groupId,
      addedBy: organizationId // System added
    }));

    await db
      .insert(assetGroupMembers)
      .values(membersToInsert)
      .onConflictDoNothing();
  }

  // Update member count
  await db
    .update(assetGroups)
    .set({
      memberCount: matchingAssets.length,
      updatedAt: new Date()
    })
    .where(eq(assetGroups.id, groupId));
}

// Get group statistics
export async function getGroupStatistics(organizationId: number) {
  const [
    totalGroups,
    dynamicGroups,
    emptyGroups,
    largestGroup
  ] = await Promise.all([
    // Total groups
    db
      .select({ count: sql<number>`count(*)` })
      .from(assetGroups)
      .where(eq(assetGroups.organizationId, organizationId)),

    // Dynamic groups
    db
      .select({ count: sql<number>`count(*)` })
      .from(assetGroups)
      .where(
        and(
          eq(assetGroups.organizationId, organizationId),
          eq(assetGroups.isDynamic, true)
        )
      ),

    // Empty groups
    db
      .select({ count: sql<number>`count(*)` })
      .from(assetGroups)
      .where(
        and(
          eq(assetGroups.organizationId, organizationId),
          eq(assetGroups.memberCount, 0)
        )
      ),

    // Largest group
    db
      .select({
        name: assetGroups.name,
        memberCount: assetGroups.memberCount
      })
      .from(assetGroups)
      .where(eq(assetGroups.organizationId, organizationId))
      .orderBy(desc(assetGroups.memberCount))
      .limit(1)
  ]);

  return {
    total: totalGroups[0]?.count || 0,
    dynamic: dynamicGroups[0]?.count || 0,
    empty: emptyGroups[0]?.count || 0,
    largest: largestGroup[0] || null
  };
}