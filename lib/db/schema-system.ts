import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { teams, users } from './schema';

// System-wide settings and configurations
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false), // Whether this setting is visible to orgs
  dataType: varchar('data_type', { length: 20 }).default('string'), // string, number, boolean, json
  category: varchar('category', { length: 50 }).notNull(), // general, security, features, limits
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: integer('updated_by').references(() => users.id),
});

// Organization resource limits and quotas
export const organizationLimits = pgTable('organization_limits', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id)
    .unique(),

  // User limits
  maxUsers: integer('max_users').notNull().default(5),
  currentUsers: integer('current_users').notNull().default(0),

  // Storage limits (in MB)
  maxStorageMb: integer('max_storage_mb').notNull().default(1024), // 1GB default
  currentStorageMb: integer('current_storage_mb').notNull().default(0),

  // Entity limits
  maxIncidents: integer('max_incidents').default(100),
  maxAssets: integer('max_assets').default(500),
  maxRunbooks: integer('max_runbooks').default(50),
  maxTemplates: integer('max_templates').default(100),

  // API limits
  apiRateLimit: integer('api_rate_limit').default(1000), // requests per hour
  apiCallsThisHour: integer('api_calls_this_hour').default(0),
  apiResetAt: timestamp('api_reset_at'),

  // Feature limits
  customDomainsAllowed: boolean('custom_domains_allowed').default(false),
  whitelabelingAllowed: boolean('whitelabeling_allowed').default(false),
  apiAccessAllowed: boolean('api_access_allowed').default(true),
  ssoAllowed: boolean('sso_allowed').default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// System-wide content templates that can be provisioned to new orgs
export const systemTemplates = pgTable('system_templates', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // runbook, communication, tag_set, dropdown
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  content: jsonb('content').notNull(), // Template content structure
  category: varchar('category', { length: 100 }),
  isDefault: boolean('is_default').default(false), // Auto-provision to new orgs
  isActive: boolean('is_active').default(true),
  version: varchar('version', { length: 20 }).default('1.0'),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  typeNameIdx: uniqueIndex('unique_system_template').on(table.type, table.name),
}));

// Dropdown options that can be managed globally
export const systemDropdowns = pgTable('system_dropdowns', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(), // incident_type, severity, asset_type, etc.
  value: varchar('value', { length: 100 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'), // Additional configuration
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  categoryValueIdx: uniqueIndex('unique_dropdown_option').on(table.category, table.value),
  categoryIdx: index('dropdown_category_idx').on(table.category),
}));

// Organization-specific dropdown overrides
export const organizationDropdowns = pgTable('organization_dropdowns', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  systemDropdownId: integer('system_dropdown_id')
    .references(() => systemDropdowns.id),
  category: varchar('category', { length: 100 }).notNull(),
  value: varchar('value', { length: 100 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  isCustom: boolean('is_custom').default(false), // True if org-specific, not from system
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  uniqueOrgDropdown: uniqueIndex('unique_org_dropdown').on(
    table.organizationId,
    table.category,
    table.value
  ),
}));

// Provisioning templates for new organizations
export const provisioningProfiles = pgTable('provisioning_profiles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  licenseType: varchar('license_type', { length: 50 }).notNull(),
  licenseCount: integer('license_count').notNull(),
  trialDays: integer('trial_days').default(14),

  // Templates to provision
  templateIds: jsonb('template_ids').default([]), // Array of systemTemplates IDs
  dropdownCategories: jsonb('dropdown_categories').default([]), // Array of dropdown categories to include

  // Default settings
  defaultFeatures: jsonb('default_features').default({}),
  defaultLimits: jsonb('default_limits').default({}),

  // Automation
  autoProvision: boolean('auto_provision').default(false),
  sendWelcomeEmail: boolean('send_welcome_email').default(true),

  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// System admin audit log (separate from org activity logs)
export const systemAuditLogs = pgTable('system_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }), // organization, user, settings, etc.
  entityId: integer('entity_id'),
  organizationId: integer('organization_id')
    .references(() => teams.id),
  changes: jsonb('changes'), // Before/after values
  metadata: jsonb('metadata'), // Additional context
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('system_audit_user_idx').on(table.userId),
  actionIdx: index('system_audit_action_idx').on(table.action),
  timestampIdx: index('system_audit_timestamp_idx').on(table.timestamp),
}));

// API keys for system integrations
export const systemApiKeys = pgTable('system_api_keys', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  keyHash: text('key_hash').notNull(), // Hashed API key
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(), // First few chars for identification
  permissions: jsonb('permissions').notNull().default([]), // Array of allowed actions
  organizationId: integer('organization_id')
    .references(() => teams.id), // Null for system-wide keys
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  revokedAt: timestamp('revoked_at'),
});

// Relations
export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}));

export const organizationLimitsRelations = relations(organizationLimits, ({ one }) => ({
  organization: one(teams, {
    fields: [organizationLimits.organizationId],
    references: [teams.id],
  }),
}));

export const systemTemplatesRelations = relations(systemTemplates, ({ one }) => ({
  createdBy: one(users, {
    fields: [systemTemplates.createdBy],
    references: [users.id],
  }),
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
}));

export const systemAuditLogsRelations = relations(systemAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemAuditLogs.userId],
    references: [users.id],
  }),
  organization: one(teams, {
    fields: [systemAuditLogs.organizationId],
    references: [teams.id],
  }),
}));

export const systemApiKeysRelations = relations(systemApiKeys, ({ one }) => ({
  createdBy: one(users, {
    fields: [systemApiKeys.createdBy],
    references: [users.id],
  }),
  organization: one(teams, {
    fields: [systemApiKeys.organizationId],
    references: [teams.id],
  }),
}));

// Type exports
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;
export type OrganizationLimit = typeof organizationLimits.$inferSelect;
export type NewOrganizationLimit = typeof organizationLimits.$inferInsert;
export type SystemTemplate = typeof systemTemplates.$inferSelect;
export type NewSystemTemplate = typeof systemTemplates.$inferInsert;
export type SystemDropdown = typeof systemDropdowns.$inferSelect;
export type NewSystemDropdown = typeof systemDropdowns.$inferInsert;
export type OrganizationDropdown = typeof organizationDropdowns.$inferSelect;
export type NewOrganizationDropdown = typeof organizationDropdowns.$inferInsert;
export type ProvisioningProfile = typeof provisioningProfiles.$inferSelect;
export type NewProvisioningProfile = typeof provisioningProfiles.$inferInsert;
export type SystemAuditLog = typeof systemAuditLogs.$inferSelect;
export type NewSystemAuditLog = typeof systemAuditLogs.$inferInsert;
export type SystemApiKey = typeof systemApiKeys.$inferSelect;
export type NewSystemApiKey = typeof systemApiKeys.$inferInsert;