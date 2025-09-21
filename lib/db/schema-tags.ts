import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { teams } from './schema';
import { assets, incidents, runbooks, communicationTemplates, tabletopExercises } from './schema-ir';

// Enums for tag and group types
export const tagCategoryEnum = pgEnum('tag_category', [
  'location',
  'department',
  'criticality',
  'compliance',
  'incident_type',
  'skill',
  'custom'
]);

export const groupTypeEnum = pgEnum('group_type', [
  'logical',
  'location',
  'department',
  'compliance',
  'custom',
  'dynamic'
]);

// Core tagging tables
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  name: varchar('name', { length: 50 }).notNull(),
  category: tagCategoryEnum('category').notNull().default('custom'),
  color: varchar('color', { length: 7 }).default('#6B7280'), // Hex color
  description: text('description'),
  isSystem: boolean('is_system').default(false), // System tags can't be deleted
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueOrgTag: uniqueIndex('unique_org_tag').on(table.organizationId, table.name),
  categoryIdx: index('tag_category_idx').on(table.category),
}));

// Polymorphic tagging relationship table
export const taggables = pgTable('taggables', {
  id: serial('id').primaryKey(),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  taggableType: varchar('taggable_type', { length: 50 }).notNull(), // 'asset', 'incident', 'runbook', etc.
  taggableId: integer('taggable_id').notNull(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueTaggable: uniqueIndex('unique_taggable').on(
    table.tagId,
    table.taggableType,
    table.taggableId
  ),
  taggableIdx: index('taggable_idx').on(table.taggableType, table.taggableId),
}));

// Asset grouping tables
export const assetGroups = pgTable('asset_groups', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: groupTypeEnum('type').notNull().default('custom'),
  parentGroupId: integer('parent_group_id')
    .references(() => assetGroups.id),

  // Dynamic group rules (stored as JSON)
  rules: jsonb('rules'), // e.g., { "tags": ["production"], "assetType": "server" }
  isDynamic: boolean('is_dynamic').default(false),

  // Group metadata
  icon: varchar('icon', { length: 50 }),
  color: varchar('color', { length: 7 }),
  sortOrder: integer('sort_order').default(0),

  // Statistics (denormalized for performance)
  memberCount: integer('member_count').default(0),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueOrgGroup: uniqueIndex('unique_org_group').on(table.organizationId, table.name),
  parentIdx: index('parent_group_idx').on(table.parentGroupId),
  typeIdx: index('group_type_idx').on(table.type),
}));

// Asset to group membership table
export const assetGroupMembers = pgTable('asset_group_members', {
  id: serial('id').primaryKey(),
  assetGroupId: integer('asset_group_id')
    .notNull()
    .references(() => assetGroups.id, { onDelete: 'cascade' }),
  assetId: integer('asset_id')
    .notNull()
    .references(() => assets.id, { onDelete: 'cascade' }),
  addedBy: integer('added_by')
    .notNull()
    .references(() => teams.id),
  addedAt: timestamp('added_at').notNull().defaultNow(),

  // Optional membership metadata
  notes: text('notes'),
  expiresAt: timestamp('expires_at'), // For temporary group memberships
}, (table) => ({
  uniqueMember: uniqueIndex('unique_group_member').on(table.assetGroupId, table.assetId),
  assetIdx: index('group_asset_idx').on(table.assetId),
}));

// Tag suggestions/templates for quick tagging
export const tagTemplates = pgTable('tag_templates', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => teams.id), // Null for system templates
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  tags: jsonb('tags').notNull(), // Array of tag names/categories
  entityType: varchar('entity_type', { length: 50 }), // Which entities this template applies to
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tag policies for compliance/governance
export const tagPolicies = pgTable('tag_policies', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  requiredTags: jsonb('required_tags').notNull(), // Array of required tag categories
  autoTags: jsonb('auto_tags'), // Rules for automatic tagging
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const tagsRelations = relations(tags, ({ one, many }) => ({
  organization: one(teams, {
    fields: [tags.organizationId],
    references: [teams.id],
  }),
  taggables: many(taggables),
}));

export const taggablesRelations = relations(taggables, ({ one }) => ({
  tag: one(tags, {
    fields: [taggables.tagId],
    references: [tags.id],
  }),
  organization: one(teams, {
    fields: [taggables.organizationId],
    references: [teams.id],
  }),
}));

export const assetGroupsRelations = relations(assetGroups, ({ one, many }) => ({
  organization: one(teams, {
    fields: [assetGroups.organizationId],
    references: [teams.id],
  }),
  parentGroup: one(assetGroups, {
    fields: [assetGroups.parentGroupId],
    references: [assetGroups.id],
  }),
  childGroups: many(assetGroups),
  members: many(assetGroupMembers),
}));

export const assetGroupMembersRelations = relations(assetGroupMembers, ({ one }) => ({
  group: one(assetGroups, {
    fields: [assetGroupMembers.assetGroupId],
    references: [assetGroups.id],
  }),
  asset: one(assets, {
    fields: [assetGroupMembers.assetId],
    references: [assets.id],
  }),
}));

// Type exports
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Taggable = typeof taggables.$inferSelect;
export type NewTaggable = typeof taggables.$inferInsert;
export type AssetGroup = typeof assetGroups.$inferSelect;
export type NewAssetGroup = typeof assetGroups.$inferInsert;
export type AssetGroupMember = typeof assetGroupMembers.$inferSelect;
export type NewAssetGroupMember = typeof assetGroupMembers.$inferInsert;
export type TagTemplate = typeof tagTemplates.$inferSelect;
export type NewTagTemplate = typeof tagTemplates.$inferInsert;
export type TagPolicy = typeof tagPolicies.$inferSelect;
export type NewTagPolicy = typeof tagPolicies.$inferInsert;

// Helper types
export interface TagWithCount extends Tag {
  count: number;
}

export interface AssetGroupWithMembers extends AssetGroup {
  members: AssetGroupMember[];
  childGroups?: AssetGroupWithMembers[];
}

export interface TaggableEntity {
  id: number;
  type: 'asset' | 'incident' | 'runbook' | 'communication' | 'exercise';
  tags: Tag[];
}