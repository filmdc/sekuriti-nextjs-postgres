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
import { teams, users } from './schema';

// Enums for content management
export const templateCategoryEnum = pgEnum('template_category', [
  'incident_response',
  'communication',
  'runbook',
  'training',
  'compliance',
  'custom'
]);

export const dropdownCategoryEnum = pgEnum('dropdown_category', [
  'asset_types',
  'criticality_levels',
  'incident_classifications',
  'severity_levels',
  'departments',
  'locations',
  'vendor_types',
  'compliance_frameworks',
  'custom'
]);

// System Templates - Global templates managed by system admins
export const systemTemplates = pgTable('system_templates', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  category: templateCategoryEnum('category').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  variables: jsonb('variables').default([]), // Array of variable definitions
  tags: jsonb('tags').default([]),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  metadata: jsonb('metadata').default({}),

  // Versioning
  version: varchar('version', { length: 20 }).default('1.0'),

  // System admin tracking
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  updatedBy: integer('updated_by')
    .references(() => users.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index('system_template_category_idx').on(table.category),
  activeIdx: index('system_template_active_idx').on(table.isActive),
  titleIdx: index('system_template_title_idx').on(table.title),
}));

// System Dropdowns - Global dropdown options managed by system admins
export const systemDropdowns = pgTable('system_dropdowns', {
  id: serial('id').primaryKey(),
  category: dropdownCategoryEnum('category').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  options: jsonb('options').notNull(), // Array of {value, label, metadata}
  isActive: boolean('is_active').default(true),
  allowCustomValues: boolean('allow_custom_values').default(false),
  sortOrder: integer('sort_order').default(0),

  // System admin tracking
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  updatedBy: integer('updated_by')
    .references(() => users.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueCategoryName: uniqueIndex('unique_dropdown_category_name').on(table.category, table.name),
  dropdownCategoryIdx: index('system_dropdown_category_idx').on(table.category),
  dropdownActiveIdx: index('dropdown_active_idx').on(table.isActive),
}));

// Organization Dropdown Overrides - Org-specific customizations
export const organizationDropdowns = pgTable('organization_dropdowns', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  systemDropdownId: integer('system_dropdown_id')
    .references(() => systemDropdowns.id),
  category: dropdownCategoryEnum('category').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  options: jsonb('options').notNull(), // Array of {value, label, metadata}
  isActive: boolean('is_active').default(true),
  allowCustomValues: boolean('allow_custom_values').default(false),
  sortOrder: integer('sort_order').default(0),

  // Organization tracking
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  updatedBy: integer('updated_by')
    .references(() => users.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueOrgCategoryName: uniqueIndex('unique_org_dropdown_category_name').on(table.organizationId, table.category, table.name),
  orgDropdownOrgIdx: index('org_dropdown_org_idx').on(table.organizationId),
  orgDropdownCategoryIdx: index('org_dropdown_category_idx').on(table.category),
  systemRefIdx: index('org_dropdown_system_ref_idx').on(table.systemDropdownId),
}));

// Default Tags - System-wide tag templates for new organizations
export const defaultTags = pgTable('default_tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  tagSet: jsonb('tag_set').notNull(), // Array of {name, category, color, description}
  entityTypes: jsonb('entity_types').notNull(), // Array of entity types this applies to
  isActive: boolean('is_active').default(true),
  isRequired: boolean('is_required').default(false), // Auto-provision for new orgs
  sortOrder: integer('sort_order').default(0),

  // System admin tracking
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  updatedBy: integer('updated_by')
    .references(() => users.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  defaultTagsNameIdx: index('default_tags_name_idx').on(table.name),
  defaultTagsActiveIdx: index('default_tags_active_idx').on(table.isActive),
  requiredIdx: index('default_tags_required_idx').on(table.isRequired),
}));

// Template Usage Tracking - Analytics for system admins
export const templateUsage = pgTable('template_usage', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id')
    .notNull()
    .references(() => systemTemplates.id),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  usageType: varchar('usage_type', { length: 50 }).notNull(), // 'viewed', 'copied', 'instantiated'
  metadata: jsonb('metadata').default({}),

  usedAt: timestamp('used_at').notNull().defaultNow(),
}, (table) => ({
  templateUsageTemplateIdx: index('template_usage_template_idx').on(table.templateId),
  templateUsageOrgIdx: index('template_usage_org_idx').on(table.organizationId),
  typeIdx: index('template_usage_type_idx').on(table.usageType),
  dateIdx: index('template_usage_date_idx').on(table.usedAt),
}));

// Relations
export const systemTemplatesRelations = relations(systemTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [systemTemplates.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [systemTemplates.updatedBy],
    references: [users.id],
  }),
  usage: many(templateUsage),
}));

export const systemDropdownsRelations = relations(systemDropdowns, ({ one, many }) => ({
  creator: one(users, {
    fields: [systemDropdowns.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [systemDropdowns.updatedBy],
    references: [users.id],
  }),
  organizationOverrides: many(organizationDropdowns),
}));

export const organizationDropdownsRelations = relations(organizationDropdowns, ({ one }) => ({
  organization: one(teams, {
    fields: [organizationDropdowns.organizationId],
    references: [teams.id],
  }),
  systemDropdown: one(systemDropdowns, {
    fields: [organizationDropdowns.systemDropdownId],
    references: [systemDropdowns.id],
  }),
  creator: one(users, {
    fields: [organizationDropdowns.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [organizationDropdowns.updatedBy],
    references: [users.id],
  }),
}));

export const defaultTagsRelations = relations(defaultTags, ({ one }) => ({
  creator: one(users, {
    fields: [defaultTags.createdBy],
    references: [users.id],
  }),
  updater: one(users, {
    fields: [defaultTags.updatedBy],
    references: [users.id],
  }),
}));

export const templateUsageRelations = relations(templateUsage, ({ one }) => ({
  template: one(systemTemplates, {
    fields: [templateUsage.templateId],
    references: [systemTemplates.id],
  }),
  organization: one(teams, {
    fields: [templateUsage.organizationId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [templateUsage.userId],
    references: [users.id],
  }),
}));

// Type exports
export type SystemTemplate = typeof systemTemplates.$inferSelect;
export type NewSystemTemplate = typeof systemTemplates.$inferInsert;
export type SystemDropdown = typeof systemDropdowns.$inferSelect;
export type NewSystemDropdown = typeof systemDropdowns.$inferInsert;
export type OrganizationDropdown = typeof organizationDropdowns.$inferSelect;
export type NewOrganizationDropdown = typeof organizationDropdowns.$inferInsert;
export type DefaultTag = typeof defaultTags.$inferSelect;
export type NewDefaultTag = typeof defaultTags.$inferInsert;
export type TemplateUsage = typeof templateUsage.$inferSelect;
export type NewTemplateUsage = typeof templateUsage.$inferInsert;

// Helper types
export interface SystemTemplateWithUsage extends SystemTemplate {
  usage: TemplateUsage[];
  usageCount: number;
}

export interface DropdownOption {
  value: string;
  label: string;
  metadata?: Record<string, any>;
}

export interface MergedDropdown {
  id: number;
  category: string;
  name: string;
  description?: string;
  options: DropdownOption[];
  isActive: boolean;
  allowCustomValues: boolean;
  source: 'system' | 'organization';
  organizationId?: number;
}

export interface TagDefinition {
  name: string;
  category: string;
  color: string;
  description?: string;
}

export interface DefaultTagSet {
  id: number;
  name: string;
  description?: string;
  tags: TagDefinition[];
  entityTypes: string[];
  isRequired: boolean;
}