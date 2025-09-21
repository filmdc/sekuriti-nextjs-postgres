'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getUser } from '@/lib/db/queries';
import {
  createAsset,
  updateAsset,
  deleteAsset,
  bulkDeleteAssets,
  addTagsToAsset,
  removeTagsFromAsset,
  bulkTagAssets,
  addAssetToGroup,
  removeAssetFromGroup,
  bulkAddAssetsToGroup,
  exportAssets
} from '@/lib/db/queries-assets';
import {
  createAssetGroup,
  updateAssetGroup,
  deleteAssetGroup,
  moveAssetsBetweenGroups,
  applyDynamicGroupRules
} from '@/lib/db/queries-groups';
import { createTag, getTagsByOrganization } from '@/lib/db/queries-tags';

// Schemas for validation
const assetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.enum(['hardware', 'software', 'service', 'data', 'personnel', 'facility', 'vendor', 'contract']),
  description: z.string().optional().nullable(),
  identifier: z.string().optional().nullable(),
  primaryContact: z.string().optional().nullable(),
  primaryContactEmail: z.string().email().optional().nullable().or(z.literal('')),
  primaryContactPhone: z.string().optional().nullable(),
  secondaryContact: z.string().optional().nullable(),
  secondaryContactEmail: z.string().email().optional().nullable().or(z.literal('')),
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

const assetGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional().nullable(),
  type: z.enum(['logical', 'location', 'department', 'compliance', 'custom', 'dynamic']).default('custom'),
  parentGroupId: z.number().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
  isDynamic: z.boolean().default(false),
  rules: z.record(z.any()).optional().nullable()
});

// Asset Actions
export async function createAssetAction(formData: FormData) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  const validatedData = assetSchema.parse({
    name: formData.get('name'),
    type: formData.get('type'),
    description: formData.get('description') || null,
    identifier: formData.get('identifier') || null,
    primaryContact: formData.get('primaryContact') || null,
    primaryContactEmail: formData.get('primaryContactEmail') || null,
    primaryContactPhone: formData.get('primaryContactPhone') || null,
    secondaryContact: formData.get('secondaryContact') || null,
    secondaryContactEmail: formData.get('secondaryContactEmail') || null,
    secondaryContactPhone: formData.get('secondaryContactPhone') || null,
    vendor: formData.get('vendor') || null,
    purchaseDate: formData.get('purchaseDate') || null,
    expiryDate: formData.get('expiryDate') || null,
    value: formData.get('value') || null,
    mustContact: formData.get('mustContact') === 'true',
    criticality: formData.get('criticality') || null,
    location: formData.get('location') || null
  });

  const asset = await createAsset({
    ...validatedData,
    organizationId: user.teamId,
    purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
    expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null
  });

  // Handle tags
  const tagIds = formData.get('tags');
  if (tagIds && typeof tagIds === 'string') {
    const ids = tagIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (ids.length > 0) {
      await addTagsToAsset(asset.id, ids, user.teamId);
    }
  }

  // Handle group
  const groupId = formData.get('groupId');
  if (groupId) {
    await addAssetToGroup(asset.id, parseInt(groupId as string), user.teamId);
  }

  revalidatePath('/assets');
  redirect(`/assets/${asset.id}`);
}

export async function updateAssetAction(id: number, formData: FormData) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  const validatedData = assetSchema.parse({
    name: formData.get('name'),
    type: formData.get('type'),
    description: formData.get('description') || null,
    identifier: formData.get('identifier') || null,
    primaryContact: formData.get('primaryContact') || null,
    primaryContactEmail: formData.get('primaryContactEmail') || null,
    primaryContactPhone: formData.get('primaryContactPhone') || null,
    secondaryContact: formData.get('secondaryContact') || null,
    secondaryContactEmail: formData.get('secondaryContactEmail') || null,
    secondaryContactPhone: formData.get('secondaryContactPhone') || null,
    vendor: formData.get('vendor') || null,
    purchaseDate: formData.get('purchaseDate') || null,
    expiryDate: formData.get('expiryDate') || null,
    value: formData.get('value') || null,
    mustContact: formData.get('mustContact') === 'true',
    criticality: formData.get('criticality') || null,
    location: formData.get('location') || null
  });

  await updateAsset(id, user.teamId, {
    ...validatedData,
    purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
    expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null
  });

  revalidatePath('/assets');
  revalidatePath(`/assets/${id}`);
  redirect(`/assets/${id}`);
}

export async function deleteAssetAction(id: number) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  await deleteAsset(id, user.teamId);
  revalidatePath('/assets');
  redirect('/assets');
}

export async function bulkDeleteAssetsAction(assetIds: number[]) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  await bulkDeleteAssets(assetIds, user.teamId);
  revalidatePath('/assets');
}

export async function bulkTagAssetsAction(assetIds: number[], tagIds: number[]) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  await bulkTagAssets(assetIds, tagIds, user.teamId);
  revalidatePath('/assets');
}

export async function bulkAddToGroupAction(assetIds: number[], groupId: number) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  await bulkAddAssetsToGroup(assetIds, groupId, user.teamId);
  revalidatePath('/assets');
}

export async function exportAssetsAction(format: 'csv' | 'json' = 'csv') {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  const data = await exportAssets(user.teamId, format);
  return data;
}

// Asset Group Actions
export async function createAssetGroupAction(formData: FormData) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  const validatedData = assetGroupSchema.parse({
    name: formData.get('name'),
    description: formData.get('description') || null,
    type: formData.get('type') || 'custom',
    parentGroupId: formData.get('parentGroupId') ? parseInt(formData.get('parentGroupId') as string) : null,
    icon: formData.get('icon') || null,
    color: formData.get('color') || null,
    sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : 0,
    isDynamic: formData.get('isDynamic') === 'true',
    rules: formData.get('rules') ? JSON.parse(formData.get('rules') as string) : null
  });

  const group = await createAssetGroup({
    ...validatedData,
    organizationId: user.teamId
  });

  // Apply dynamic rules if it's a dynamic group
  if (group.isDynamic && group.rules) {
    await applyDynamicGroupRules(group.id, user.teamId);
  }

  revalidatePath('/assets/groups');
  redirect('/assets/groups');
}

export async function updateAssetGroupAction(id: number, formData: FormData) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  const validatedData = assetGroupSchema.parse({
    name: formData.get('name'),
    description: formData.get('description') || null,
    type: formData.get('type') || 'custom',
    parentGroupId: formData.get('parentGroupId') ? parseInt(formData.get('parentGroupId') as string) : null,
    icon: formData.get('icon') || null,
    color: formData.get('color') || null,
    sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : 0,
    isDynamic: formData.get('isDynamic') === 'true',
    rules: formData.get('rules') ? JSON.parse(formData.get('rules') as string) : null
  });

  await updateAssetGroup(id, user.teamId, validatedData);

  // Apply dynamic rules if it's a dynamic group
  if (validatedData.isDynamic && validatedData.rules) {
    await applyDynamicGroupRules(id, user.teamId);
  }

  revalidatePath('/assets/groups');
}

export async function deleteAssetGroupAction(id: number) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  await deleteAssetGroup(id, user.teamId);
  revalidatePath('/assets/groups');
}

export async function moveAssetsAction(
  assetIds: number[],
  fromGroupId: number | null,
  toGroupId: number
) {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  await moveAssetsBetweenGroups(assetIds, fromGroupId, toGroupId, user.teamId);
  revalidatePath('/assets');
  revalidatePath('/assets/groups');
}

// Tag Actions
export async function createTagAction(name: string, category: string = 'custom', color: string = '#6B7280') {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  const tag = await createTag({
    organizationId: user.teamId,
    name,
    category: category as any,
    color
  });

  revalidatePath('/assets');
  return tag;
}

export async function getTagsAction() {
  const user = await getUser();
  if (!user?.teamId) {
    throw new Error('User not authenticated or not part of a team');
  }

  return getTagsByOrganization(user.teamId);
}