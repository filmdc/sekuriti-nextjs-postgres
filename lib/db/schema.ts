import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  // Additional fields for IR platform
  phone: varchar('phone', { length: 50 }),
  title: varchar('title', { length: 100 }),
  department: varchar('department', { length: 100 }),
  isOrganizationAdmin: boolean('is_organization_admin').default(false),
  isSystemAdmin: boolean('is_system_admin').default(false), // System admin flag
  profileImageUrl: text('profile_image_url'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Legacy name for compatibility - will be migrated to organizations
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
  // Organization-specific fields
  industry: varchar('industry', { length: 100 }),
  size: varchar('size', { length: 50 }), // small, medium, large
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  website: varchar('website', { length: 255 }),
  // System admin fields for organization management
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, suspended, trial, expired
  licenseCount: integer('license_count').notNull().default(5), // Number of allowed users
  licenseType: varchar('license_type', { length: 50 }).default('standard'), // standard, professional, enterprise
  expiresAt: timestamp('expires_at'), // License expiration date
  trialEndsAt: timestamp('trial_ends_at'), // Trial period end date
  customDomain: varchar('custom_domain', { length: 255 }), // Custom domain for white-labeling
  allowedEmailDomains: text('allowed_email_domains'), // JSON array of allowed email domains
  features: text('features'), // JSON object for feature flags
  metadata: text('metadata'), // JSON object for additional settings
});

// Alias for semantic clarity in IR context
export const organizations = teams;

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  // Incident Response activities
  CREATE_INCIDENT = 'CREATE_INCIDENT',
  UPDATE_INCIDENT = 'UPDATE_INCIDENT',
  CLOSE_INCIDENT = 'CLOSE_INCIDENT',
  CREATE_ASSET = 'CREATE_ASSET',
  UPDATE_ASSET = 'UPDATE_ASSET',
  DELETE_ASSET = 'DELETE_ASSET',
  CREATE_RUNBOOK = 'CREATE_RUNBOOK',
  UPDATE_RUNBOOK = 'UPDATE_RUNBOOK',
  START_EXERCISE = 'START_EXERCISE',
  COMPLETE_EXERCISE = 'COMPLETE_EXERCISE',
  UPLOAD_EVIDENCE = 'UPLOAD_EVIDENCE',
  // System Admin activities
  CREATE_ORGANIZATION = 'CREATE_ORGANIZATION',
  UPDATE_ORGANIZATION = 'UPDATE_ORGANIZATION',
  SUSPEND_ORGANIZATION = 'SUSPEND_ORGANIZATION',
  DELETE_ORGANIZATION = 'DELETE_ORGANIZATION',
  UPDATE_LICENSES = 'UPDATE_LICENSES',
  IMPERSONATE_USER = 'IMPERSONATE_USER',
  UPDATE_SYSTEM_SETTINGS = 'UPDATE_SYSTEM_SETTINGS',
  PROVISION_ORGANIZATION = 'PROVISION_ORGANIZATION',
}
