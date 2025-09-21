import { desc, and, eq, sql, like, or } from 'drizzle-orm';
import { db } from './drizzle';
import { tags, taggables } from './schema-tags';
import type { Tag, NewTag } from './schema-tags';

// Get all tags for an organization
export async function getTagsByOrganization(organizationId: number) {
  return db
    .select()
    .from(tags)
    .where(eq(tags.organizationId, organizationId))
    .orderBy(desc(tags.usageCount), tags.name);
}

// Get tags by category
export async function getTagsByCategory(organizationId: number, category: string) {
  return db
    .select()
    .from(tags)
    .where(
      and(
        eq(tags.organizationId, organizationId),
        eq(tags.category, category as any)
      )
    )
    .orderBy(tags.name);
}

// Search tags
export async function searchTags(organizationId: number, query: string) {
  return db
    .select()
    .from(tags)
    .where(
      and(
        eq(tags.organizationId, organizationId),
        like(tags.name, `%${query}%`)
      )
    )
    .orderBy(desc(tags.usageCount))
    .limit(10);
}

// Create a new tag
export async function createTag(data: NewTag) {
  const [newTag] = await db
    .insert(tags)
    .values(data)
    .returning();

  return newTag;
}

// Update a tag
export async function updateTag(id: number, organizationId: number, data: Partial<NewTag>) {
  const [updatedTag] = await db
    .update(tags)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(tags.id, id),
        eq(tags.organizationId, organizationId)
      )
    )
    .returning();

  return updatedTag;
}

// Delete a tag
export async function deleteTag(id: number, organizationId: number) {
  // First remove all taggables
  await db
    .delete(taggables)
    .where(eq(taggables.tagId, id));

  // Then delete the tag
  const [deletedTag] = await db
    .delete(tags)
    .where(
      and(
        eq(tags.id, id),
        eq(tags.organizationId, organizationId),
        eq(tags.isSystem, false) // Can't delete system tags
      )
    )
    .returning();

  return deletedTag;
}

// Get tags for a specific entity
export async function getTagsForEntity(
  entityType: string,
  entityId: number,
  organizationId: number
) {
  return db
    .select({
      tag: tags
    })
    .from(taggables)
    .innerJoin(tags, eq(taggables.tagId, tags.id))
    .where(
      and(
        eq(taggables.taggableType, entityType),
        eq(taggables.taggableId, entityId),
        eq(taggables.organizationId, organizationId)
      )
    );
}

// Get popular tags
export async function getPopularTags(organizationId: number, limit = 10) {
  return db
    .select()
    .from(tags)
    .where(eq(tags.organizationId, organizationId))
    .orderBy(desc(tags.usageCount))
    .limit(limit);
}

// Get tag statistics
export async function getTagStatistics(organizationId: number) {
  const [
    totalTags,
    totalTaggings,
    tagsByCategory
  ] = await Promise.all([
    // Total tags
    db
      .select({ count: sql<number>`count(*)` })
      .from(tags)
      .where(eq(tags.organizationId, organizationId)),

    // Total taggings
    db
      .select({ count: sql<number>`count(*)` })
      .from(taggables)
      .where(eq(taggables.organizationId, organizationId)),

    // Tags by category
    db
      .select({
        category: tags.category,
        count: sql<number>`count(*)`
      })
      .from(tags)
      .where(eq(tags.organizationId, organizationId))
      .groupBy(tags.category)
  ]);

  return {
    total: totalTags[0]?.count || 0,
    totalTaggings: totalTaggings[0]?.count || 0,
    byCategory: tagsByCategory
  };
}

// Merge two tags
export async function mergeTags(
  sourceTagId: number,
  targetTagId: number,
  organizationId: number
) {
  // Update all taggables from source to target
  await db
    .update(taggables)
    .set({ tagId: targetTagId })
    .where(
      and(
        eq(taggables.tagId, sourceTagId),
        eq(taggables.organizationId, organizationId)
      )
    );

  // Update usage count of target tag
  const [sourceUsage] = await db
    .select({ count: sql<number>`count(*)` })
    .from(taggables)
    .where(eq(taggables.tagId, sourceTagId));

  await db
    .update(tags)
    .set({
      usageCount: sql`${tags.usageCount} + ${sourceUsage.count}`,
      updatedAt: new Date()
    })
    .where(eq(tags.id, targetTagId));

  // Delete source tag
  await deleteTag(sourceTagId, organizationId);
}