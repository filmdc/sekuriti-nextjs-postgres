import { db } from './drizzle';
import {
  systemTemplates,
  systemDropdowns,
  organizationDropdowns,
  defaultTags,
  templateUsage,
  SystemTemplate,
  SystemDropdown,
  OrganizationDropdown,
  DefaultTag,
  MergedDropdown,
  NewSystemTemplate,
  NewSystemDropdown,
  NewOrganizationDropdown,
  NewDefaultTag,
  NewTemplateUsage,
} from './schema-content';
import { communicationTemplates } from './schema-ir';
import { tags } from './schema-tags';
import { teams, users } from './schema';
import { eq, and, or, like, desc, asc, sql, inArray } from 'drizzle-orm';
import { ListParams, PaginatedResponse } from '@/lib/types/api';

// System Templates Queries
export async function getSystemTemplates(params: ListParams = {}) {
  const {
    page = 1,
    limit = 50,
    search,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    filters = {},
  } = params;

  const offset = (page - 1) * limit;

  let query = db
    .select({
      id: systemTemplates.id,
      title: systemTemplates.title,
      category: systemTemplates.category,
      description: systemTemplates.description,
      content: systemTemplates.content,
      variables: systemTemplates.variables,
      tags: systemTemplates.tags,
      isActive: systemTemplates.isActive,
      sortOrder: systemTemplates.sortOrder,
      version: systemTemplates.version,
      metadata: systemTemplates.metadata,
      createdBy: systemTemplates.createdBy,
      updatedBy: systemTemplates.updatedBy,
      createdAt: systemTemplates.createdAt,
      updatedAt: systemTemplates.updatedAt,
      creatorName: users.name,
    })
    .from(systemTemplates)
    .leftJoin(users, eq(systemTemplates.createdBy, users.id))
    .$dynamic();

  // Apply filters
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(systemTemplates.title, `%${search}%`),
        like(systemTemplates.description, `%${search}%`)
      )
    );
  }

  if (filters.category) {
    conditions.push(eq(systemTemplates.category, filters.category));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(systemTemplates.isActive, filters.isActive));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  const sortColumn = sortBy === 'title' ? systemTemplates.title :
                    sortBy === 'category' ? systemTemplates.category :
                    sortBy === 'createdAt' ? systemTemplates.createdAt :
                    systemTemplates.updatedAt;

  query = query.orderBy(
    sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)
  );

  // Get total count
  const totalQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(systemTemplates)
    .$dynamic();

  if (conditions.length > 0) {
    totalQuery.where(and(...conditions));
  }

  const [results, totalResult] = await Promise.all([
    query.limit(limit).offset(offset),
    totalQuery,
  ]);

  const total = totalResult[0]?.count || 0;

  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export async function getSystemTemplateById(id: number) {
  const result = await db
    .select({
      id: systemTemplates.id,
      title: systemTemplates.title,
      category: systemTemplates.category,
      description: systemTemplates.description,
      content: systemTemplates.content,
      variables: systemTemplates.variables,
      tags: systemTemplates.tags,
      isActive: systemTemplates.isActive,
      sortOrder: systemTemplates.sortOrder,
      version: systemTemplates.version,
      metadata: systemTemplates.metadata,
      createdBy: systemTemplates.createdBy,
      updatedBy: systemTemplates.updatedBy,
      createdAt: systemTemplates.createdAt,
      updatedAt: systemTemplates.updatedAt,
      creatorName: users.name,
    })
    .from(systemTemplates)
    .leftJoin(users, eq(systemTemplates.createdBy, users.id))
    .where(eq(systemTemplates.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createSystemTemplate(data: NewSystemTemplate) {
  const result = await db
    .insert(systemTemplates)
    .values(data)
    .returning();

  return result[0];
}

export async function updateSystemTemplate(id: number, data: Partial<SystemTemplate>) {
  const result = await db
    .update(systemTemplates)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(systemTemplates.id, id))
    .returning();

  return result[0] || null;
}

export async function deleteSystemTemplate(id: number) {
  await db
    .delete(systemTemplates)
    .where(eq(systemTemplates.id, id));

  return true;
}

// System Dropdowns Queries
export async function getSystemDropdowns(params: ListParams = {}) {
  const {
    page = 1,
    limit = 50,
    search,
    sortBy = 'category',
    sortOrder = 'asc',
    filters = {},
  } = params;

  const offset = (page - 1) * limit;

  let query = db
    .select({
      id: systemDropdowns.id,
      category: systemDropdowns.category,
      name: systemDropdowns.name,
      description: systemDropdowns.description,
      options: systemDropdowns.options,
      isActive: systemDropdowns.isActive,
      allowCustomValues: systemDropdowns.allowCustomValues,
      sortOrder: systemDropdowns.sortOrder,
      createdBy: systemDropdowns.createdBy,
      updatedBy: systemDropdowns.updatedBy,
      createdAt: systemDropdowns.createdAt,
      updatedAt: systemDropdowns.updatedAt,
      creatorName: users.name,
    })
    .from(systemDropdowns)
    .leftJoin(users, eq(systemDropdowns.createdBy, users.id))
    .$dynamic();

  // Apply filters
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(systemDropdowns.name, `%${search}%`),
        like(systemDropdowns.description, `%${search}%`)
      )
    );
  }

  if (filters.category) {
    conditions.push(eq(systemDropdowns.category, filters.category));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(systemDropdowns.isActive, filters.isActive));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  const sortColumn = sortBy === 'name' ? systemDropdowns.name :
                    sortBy === 'createdAt' ? systemDropdowns.createdAt :
                    sortBy === 'updatedAt' ? systemDropdowns.updatedAt :
                    systemDropdowns.category;

  query = query.orderBy(
    sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)
  );

  // Get total count
  const totalQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(systemDropdowns)
    .$dynamic();

  if (conditions.length > 0) {
    totalQuery.where(and(...conditions));
  }

  const [results, totalResult] = await Promise.all([
    query.limit(limit).offset(offset),
    totalQuery,
  ]);

  const total = totalResult[0]?.count || 0;

  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export async function getSystemDropdownById(id: number) {
  const result = await db
    .select()
    .from(systemDropdowns)
    .where(eq(systemDropdowns.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createSystemDropdown(data: NewSystemDropdown) {
  const result = await db
    .insert(systemDropdowns)
    .values(data)
    .returning();

  return result[0];
}

export async function updateSystemDropdown(id: number, data: Partial<SystemDropdown>) {
  const result = await db
    .update(systemDropdowns)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(systemDropdowns.id, id))
    .returning();

  return result[0] || null;
}

export async function deleteSystemDropdown(id: number) {
  await db
    .delete(systemDropdowns)
    .where(eq(systemDropdowns.id, id));

  return true;
}

// Merged Dropdowns (System + Organization)
export async function getMergedDropdowns(
  organizationId: number,
  category?: string
): Promise<MergedDropdown[]> {
  // Get system dropdowns
  const systemQuery = db
    .select({
      id: systemDropdowns.id,
      category: systemDropdowns.category,
      name: systemDropdowns.name,
      description: systemDropdowns.description,
      options: systemDropdowns.options,
      isActive: systemDropdowns.isActive,
      allowCustomValues: systemDropdowns.allowCustomValues,
    })
    .from(systemDropdowns)
    .where(
      and(
        eq(systemDropdowns.isActive, true),
        category ? eq(systemDropdowns.category, category) : sql`true`
      )
    );

  // Get organization overrides
  const orgQuery = db
    .select({
      id: organizationDropdowns.id,
      category: organizationDropdowns.category,
      name: organizationDropdowns.name,
      description: organizationDropdowns.description,
      options: organizationDropdowns.options,
      isActive: organizationDropdowns.isActive,
      allowCustomValues: organizationDropdowns.allowCustomValues,
      systemDropdownId: organizationDropdowns.systemDropdownId,
    })
    .from(organizationDropdowns)
    .where(
      and(
        eq(organizationDropdowns.organizationId, organizationId),
        eq(organizationDropdowns.isActive, true),
        category ? eq(organizationDropdowns.category, category) : sql`true`
      )
    );

  const [systemResults, orgResults] = await Promise.all([systemQuery, orgQuery]);

  // Merge results, with organization overrides taking precedence
  const mergedMap = new Map<string, MergedDropdown>();

  // Add system dropdowns
  systemResults.forEach(dropdown => {
    const key = `${dropdown.category}:${dropdown.name}`;
    mergedMap.set(key, {
      ...dropdown,
      source: 'system',
    });
  });

  // Override with organization dropdowns
  orgResults.forEach(dropdown => {
    const key = `${dropdown.category}:${dropdown.name}`;
    mergedMap.set(key, {
      id: dropdown.id,
      category: dropdown.category,
      name: dropdown.name,
      description: dropdown.description,
      options: dropdown.options as any,
      isActive: dropdown.isActive,
      allowCustomValues: dropdown.allowCustomValues,
      source: 'organization',
      organizationId,
    });
  });

  return Array.from(mergedMap.values());
}

// Default Tags Queries
export async function getDefaultTags(params: ListParams = {}) {
  const {
    page = 1,
    limit = 50,
    search,
    sortBy = 'sortOrder',
    sortOrder = 'asc',
    filters = {},
  } = params;

  const offset = (page - 1) * limit;

  let query = db
    .select({
      id: defaultTags.id,
      name: defaultTags.name,
      description: defaultTags.description,
      tagSet: defaultTags.tagSet,
      entityTypes: defaultTags.entityTypes,
      isActive: defaultTags.isActive,
      isRequired: defaultTags.isRequired,
      sortOrder: defaultTags.sortOrder,
      createdBy: defaultTags.createdBy,
      updatedBy: defaultTags.updatedBy,
      createdAt: defaultTags.createdAt,
      updatedAt: defaultTags.updatedAt,
      creatorName: users.name,
    })
    .from(defaultTags)
    .leftJoin(users, eq(defaultTags.createdBy, users.id))
    .$dynamic();

  // Apply filters
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(defaultTags.name, `%${search}%`),
        like(defaultTags.description, `%${search}%`)
      )
    );
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(defaultTags.isActive, filters.isActive));
  }

  if (filters.isRequired !== undefined) {
    conditions.push(eq(defaultTags.isRequired, filters.isRequired));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  const sortColumn = sortBy === 'name' ? defaultTags.name :
                    sortBy === 'createdAt' ? defaultTags.createdAt :
                    sortBy === 'updatedAt' ? defaultTags.updatedAt :
                    defaultTags.sortOrder;

  query = query.orderBy(
    sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)
  );

  // Get total count
  const totalQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(defaultTags)
    .$dynamic();

  if (conditions.length > 0) {
    totalQuery.where(and(...conditions));
  }

  const [results, totalResult] = await Promise.all([
    query.limit(limit).offset(offset),
    totalQuery,
  ]);

  const total = totalResult[0]?.count || 0;

  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export async function getDefaultTagById(id: number) {
  const result = await db
    .select()
    .from(defaultTags)
    .where(eq(defaultTags.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createDefaultTag(data: NewDefaultTag) {
  const result = await db
    .insert(defaultTags)
    .values(data)
    .returning();

  return result[0];
}

export async function updateDefaultTag(id: number, data: Partial<DefaultTag>) {
  const result = await db
    .update(defaultTags)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(defaultTags.id, id))
    .returning();

  return result[0] || null;
}

export async function deleteDefaultTag(id: number) {
  await db
    .delete(defaultTags)
    .where(eq(defaultTags.id, id));

  return true;
}

// Template Usage Tracking
export async function recordTemplateUsage(data: NewTemplateUsage) {
  const result = await db
    .insert(templateUsage)
    .values(data)
    .returning();

  return result[0];
}

// Get effective tags for organization (system defaults + organization tags)
export async function getEffectiveTags(organizationId: number) {
  // Get active default tag sets
  const defaultTagSets = await db
    .select()
    .from(defaultTags)
    .where(
      and(
        eq(defaultTags.isActive, true),
        eq(defaultTags.isRequired, true)
      )
    );

  // Get existing organization tags
  const orgTags = await db
    .select()
    .from(tags)
    .where(eq(tags.organizationId, organizationId));

  // Merge and return effective tag sets
  return {
    defaultTagSets,
    organizationTags: orgTags,
  };
}

// Provision default tags for new organization
export async function provisionDefaultTagsForOrganization(organizationId: number, userId: number) {
  const requiredTagSets = await db
    .select()
    .from(defaultTags)
    .where(
      and(
        eq(defaultTags.isActive, true),
        eq(defaultTags.isRequired, true)
      )
    );

  const newTags = [];

  for (const tagSet of requiredTagSets) {
    const tagDefinitions = tagSet.tagSet as any[];

    for (const tagDef of tagDefinitions) {
      newTags.push({
        organizationId,
        name: tagDef.name,
        category: tagDef.category,
        color: tagDef.color,
        description: tagDef.description,
        isSystem: true,
      });
    }
  }

  if (newTags.length > 0) {
    const result = await db
      .insert(tags)
      .values(newTags)
      .returning();

    return result;
  }

  return [];
}

// Get merged templates (system + organization communication templates)
export async function getMergedTemplates(organizationId: number, category?: string) {
  // Get system templates
  const systemQuery = db
    .select({
      id: systemTemplates.id,
      title: systemTemplates.title,
      category: systemTemplates.category,
      description: systemTemplates.description,
      content: systemTemplates.content,
      variables: systemTemplates.variables,
      tags: systemTemplates.tags,
      isActive: systemTemplates.isActive,
      version: systemTemplates.version,
      source: sql<string>`'system'`.as('source'),
      createdAt: systemTemplates.createdAt,
      updatedAt: systemTemplates.updatedAt,
    })
    .from(systemTemplates)
    .where(
      and(
        eq(systemTemplates.isActive, true),
        category ? eq(systemTemplates.category, category) : sql`true`
      )
    );

  // Get organization communication templates
  const orgQuery = db
    .select({
      id: communicationTemplates.id,
      title: communicationTemplates.title,
      category: communicationTemplates.category,
      description: sql<string>`''`.as('description'),
      content: communicationTemplates.content,
      variables: sql<any>`'[]'`.as('variables'),
      tags: communicationTemplates.tags,
      isActive: sql<boolean>`true`.as('isActive'),
      version: sql<string>`'1.0'`.as('version'),
      source: sql<string>`'organization'`.as('source'),
      createdAt: communicationTemplates.createdAt,
      updatedAt: communicationTemplates.updatedAt,
    })
    .from(communicationTemplates)
    .where(
      and(
        eq(communicationTemplates.organizationId, organizationId),
        category ? eq(communicationTemplates.category, category) : sql`true`
      )
    );

  const [systemResults, orgResults] = await Promise.all([systemQuery, orgQuery]);

  return [...systemResults, ...orgResults];
}