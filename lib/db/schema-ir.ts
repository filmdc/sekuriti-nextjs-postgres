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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, teams } from './schema';

// Enums for incident management
export const incidentStatusEnum = pgEnum('incident_status', [
  'open',
  'contained',
  'eradicated',
  'recovered',
  'closed',
  'post_incident'
]);

export const incidentSeverityEnum = pgEnum('incident_severity', [
  'low',
  'medium',
  'high',
  'critical'
]);

export const incidentClassificationEnum = pgEnum('incident_classification', [
  'malware',
  'phishing',
  'data_breach',
  'ddos',
  'insider_threat',
  'ransomware',
  'social_engineering',
  'supply_chain',
  'other'
]);

export const assetTypeEnum = pgEnum('asset_type', [
  'hardware',
  'software',
  'service',
  'data',
  'personnel',
  'facility',
  'vendor',
  'contract'
]);

// Core incident response tables

export const incidents = pgTable('incidents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  referenceNumber: varchar('reference_number', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  classification: incidentClassificationEnum('classification').notNull(),
  severity: incidentSeverityEnum('severity').notNull(),
  status: incidentStatusEnum('status').notNull().default('open'),

  // Phase timestamps
  detectedAt: timestamp('detected_at').notNull().defaultNow(),
  containedAt: timestamp('contained_at'),
  eradicatedAt: timestamp('eradicated_at'),
  recoveredAt: timestamp('recovered_at'),
  closedAt: timestamp('closed_at'),

  // Phase details
  detectionDetails: text('detection_details'),
  containmentDetails: text('containment_details'),
  eradicationDetails: text('eradication_details'),
  recoveryDetails: text('recovery_details'),
  postIncidentNotes: text('post_incident_notes'),
  stakeholderComms: text('stakeholder_comms'),

  // Relationships
  reportedBy: integer('reported_by')
    .notNull()
    .references(() => users.id),
  assignedTo: integer('assigned_to')
    .references(() => users.id),
  runbookId: integer('runbook_id')
    .references(() => runbooks.id),

  // Metadata
  estimatedImpact: text('estimated_impact'),
  lessonsLearned: text('lessons_learned'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  name: varchar('name', { length: 255 }).notNull(),
  type: assetTypeEnum('type').notNull(),
  description: text('description'),
  identifier: varchar('identifier', { length: 255 }), // Serial number, license key, etc.

  // Contact information
  primaryContact: varchar('primary_contact', { length: 255 }),
  primaryContactEmail: varchar('primary_contact_email', { length: 255 }),
  primaryContactPhone: varchar('primary_contact_phone', { length: 50 }),
  secondaryContact: varchar('secondary_contact', { length: 255 }),
  secondaryContactEmail: varchar('secondary_contact_email', { length: 255 }),
  secondaryContactPhone: varchar('secondary_contact_phone', { length: 50 }),

  // Vendor/Contract details
  vendor: varchar('vendor', { length: 255 }),
  purchaseDate: timestamp('purchase_date'),
  expiryDate: timestamp('expiry_date'),
  value: varchar('value', { length: 50 }),

  // Incident response specific
  mustContact: boolean('must_contact').default(false),
  criticality: varchar('criticality', { length: 20 }), // low, medium, high, critical
  location: varchar('location', { length: 255 }),

  // Additional data
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const runbooks = pgTable('runbooks', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => teams.id), // Null for system templates
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  classification: incidentClassificationEnum('classification'),
  isTemplate: boolean('is_template').default(false),
  isActive: boolean('is_active').default(true),

  // Versioning
  version: varchar('version', { length: 20 }).default('1.0'),

  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const runbookSteps = pgTable('runbook_steps', {
  id: serial('id').primaryKey(),
  runbookId: integer('runbook_id')
    .notNull()
    .references(() => runbooks.id, { onDelete: 'cascade' }),
  phase: varchar('phase', { length: 50 }).notNull(), // detection, containment, etc.
  stepNumber: integer('step_number').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),

  // Responsibility assignment
  responsibleRole: varchar('responsible_role', { length: 100 }), // e.g., "Security Analyst", "IT Admin"
  assignedTo: integer('assigned_to')
    .references(() => users.id),

  // Timing
  estimatedDuration: integer('estimated_duration'), // in minutes
  isCritical: boolean('is_critical').default(false),

  // Additional guidance
  tools: text('tools'), // Tools or scripts needed
  notes: text('notes'), // Additional notes or warnings

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const incidentAssets = pgTable('incident_assets', {
  id: serial('id').primaryKey(),
  incidentId: integer('incident_id')
    .notNull()
    .references(() => incidents.id, { onDelete: 'cascade' }),
  assetId: integer('asset_id')
    .notNull()
    .references(() => assets.id),
  affectedAt: timestamp('affected_at').notNull().defaultNow(),
  impact: text('impact'),
  status: varchar('status', { length: 50 }), // affected, isolated, recovered
});

export const incidentEvidence = pgTable('incident_evidence', {
  id: serial('id').primaryKey(),
  incidentId: integer('incident_id')
    .notNull()
    .references(() => incidents.id, { onDelete: 'cascade' }),
  phase: varchar('phase', { length: 50 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  fileType: varchar('file_type', { length: 100 }),
  description: text('description'),
  uploadedBy: integer('uploaded_by')
    .notNull()
    .references(() => users.id),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

export const communicationTemplates = pgTable('communication_templates', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => teams.id), // Null for system templates
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  tags: jsonb('tags').default([]),
  subject: varchar('subject', { length: 255 }),
  content: text('content').notNull(),
  isDefault: boolean('is_default').default(false),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insurancePolicies = pgTable('insurance_policies', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  provider: varchar('provider', { length: 255 }).notNull(),
  policyNumber: varchar('policy_number', { length: 100 }).notNull(),
  coverageType: varchar('coverage_type', { length: 100 }).notNull(),
  coverageAmount: varchar('coverage_amount', { length: 50 }),
  deductible: varchar('deductible', { length: 50 }),

  // Contact information
  contactName: varchar('contact_name', { length: 255 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),

  // Policy period
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),

  // Claims
  claimsContact: varchar('claims_contact', { length: 255 }),
  claimsPhone: varchar('claims_phone', { length: 50 }),
  claimsEmail: varchar('claims_email', { length: 255 }),

  // Documents
  policyDocument: text('policy_document'), // URL to stored document
  additionalNotes: text('additional_notes'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tabletopExercises = pgTable('tabletop_exercises', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scenario: text('scenario').notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull(), // beginner, intermediate, advanced
  estimatedDuration: integer('estimated_duration'), // in minutes
  category: varchar('category', { length: 100 }),
  objectives: jsonb('objectives').default([]),
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const exerciseQuestions = pgTable('exercise_questions', {
  id: serial('id').primaryKey(),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => tabletopExercises.id, { onDelete: 'cascade' }),
  questionNumber: integer('question_number').notNull(),
  question: text('question').notNull(),
  options: jsonb('options').notNull(), // Array of {id, text}
  correctAnswer: varchar('correct_answer', { length: 10 }).notNull(),
  explanation: text('explanation'),
  points: integer('points').default(1),
});

export const exerciseCompletions = pgTable('exercise_completions', {
  id: serial('id').primaryKey(),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => tabletopExercises.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  score: integer('score'),
  totalScore: integer('total_score'),
  answers: jsonb('answers'), // Array of {questionId, answer}
  feedback: text('feedback'),
  certificateUrl: text('certificate_url'),
});

export const twoFactorCodes = pgTable('two_factor_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  organization: one(teams, {
    fields: [incidents.organizationId],
    references: [teams.id],
  }),
  reporter: one(users, {
    fields: [incidents.reportedBy],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [incidents.assignedTo],
    references: [users.id],
  }),
  runbook: one(runbooks, {
    fields: [incidents.runbookId],
    references: [runbooks.id],
  }),
  affectedAssets: many(incidentAssets),
  evidence: many(incidentEvidence),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  organization: one(teams, {
    fields: [assets.organizationId],
    references: [teams.id],
  }),
  incidents: many(incidentAssets),
}));

export const runbooksRelations = relations(runbooks, ({ one, many }) => ({
  organization: one(teams, {
    fields: [runbooks.organizationId],
    references: [teams.id],
  }),
  creator: one(users, {
    fields: [runbooks.createdBy],
    references: [users.id],
  }),
  steps: many(runbookSteps),
  incidents: many(incidents),
}));

export const runbookStepsRelations = relations(runbookSteps, ({ one }) => ({
  runbook: one(runbooks, {
    fields: [runbookSteps.runbookId],
    references: [runbooks.id],
  }),
  assignee: one(users, {
    fields: [runbookSteps.assignedTo],
    references: [users.id],
  }),
}));

export const tabletopExercisesRelations = relations(tabletopExercises, ({ one, many }) => ({
  creator: one(users, {
    fields: [tabletopExercises.createdBy],
    references: [users.id],
  }),
  questions: many(exerciseQuestions),
  completions: many(exerciseCompletions),
}));

// Type exports
export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Runbook = typeof runbooks.$inferSelect;
export type NewRunbook = typeof runbooks.$inferInsert;
export type RunbookStep = typeof runbookSteps.$inferSelect;
export type NewRunbookStep = typeof runbookSteps.$inferInsert;
export type CommunicationTemplate = typeof communicationTemplates.$inferSelect;
export type NewCommunicationTemplate = typeof communicationTemplates.$inferInsert;
export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type NewInsurancePolicy = typeof insurancePolicies.$inferInsert;
export type TabletopExercise = typeof tabletopExercises.$inferSelect;
export type NewTabletopExercise = typeof tabletopExercises.$inferInsert;
export type ExerciseQuestion = typeof exerciseQuestions.$inferSelect;
export type NewExerciseQuestion = typeof exerciseQuestions.$inferInsert;
export type ExerciseCompletion = typeof exerciseCompletions.$inferSelect;
export type NewExerciseCompletion = typeof exerciseCompletions.$inferInsert;