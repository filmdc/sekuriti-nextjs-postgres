import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  jsonb,
  uniqueIndex,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { teams, users } from './schema';

// Enums for billing
export const billingIntervalEnum = pgEnum('billing_interval', ['monthly', 'yearly', 'one_time']);
export const subscriptionStatusEnum = pgEnum('subscription_status_enum', [
  'active',
  'canceled',
  'past_due',
  'paused',
  'trialing',
  'incomplete',
  'incomplete_expired',
]);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded']);
export const planTypeEnum = pgEnum('plan_type', ['free', 'standard', 'professional', 'enterprise', 'custom']);

// Subscription Plans (Master list of available plans)
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  description: text('description'),
  type: planTypeEnum('type').notNull(),

  // Pricing
  monthlyPrice: decimal('monthly_price', { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal('yearly_price', { precision: 10, scale: 2 }).notNull(),
  setupFee: decimal('setup_fee', { precision: 10, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),

  // Stripe references
  stripeMonthlyPriceId: varchar('stripe_monthly_price_id', { length: 255 }),
  stripeYearlyPriceId: varchar('stripe_yearly_price_id', { length: 255 }),
  stripeProductId: varchar('stripe_product_id', { length: 255 }),

  // Limits and features
  maxUsers: integer('max_users').notNull(),
  maxIncidents: integer('max_incidents').notNull(),
  maxAssets: integer('max_assets').notNull(),
  maxRunbooks: integer('max_runbooks').notNull(),
  maxStorageGb: integer('max_storage_gb').notNull(),

  // Features (stored as JSON for flexibility)
  features: jsonb('features').notNull().default('{}'),

  // Trial
  trialDays: integer('trial_days').default(14),

  // Visibility
  isActive: boolean('is_active').default(true).notNull(),
  isPublic: boolean('is_public').default(true).notNull(), // Show on pricing page
  isDefault: boolean('is_default').default(false).notNull(), // Default plan for new signups
  sortOrder: integer('sort_order').default(0),

  // Metadata
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: uniqueIndex('unique_plan_name').on(table.name),
  stripeProductIdx: index('plan_stripe_product_idx').on(table.stripeProductId),
}));

// Active Subscriptions (Current subscription for each organization)
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  planId: integer('plan_id')
    .notNull()
    .references(() => subscriptionPlans.id),

  // Subscription details
  status: subscriptionStatusEnum('status').notNull(),
  billingInterval: billingIntervalEnum('billing_interval').notNull(),

  // Pricing at time of subscription (may differ from current plan price)
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),

  // Stripe references
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),

  // Dates
  startDate: timestamp('start_date').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  canceledAt: timestamp('canceled_at'),
  cancelationReason: text('cancelation_reason'),
  endedAt: timestamp('ended_at'),

  // Trial
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),

  // User tracking
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),

  // Metadata
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orgIdx: index('subscription_org_idx').on(table.organizationId),
  stripeSubIdx: uniqueIndex('unique_stripe_subscription').on(table.stripeSubscriptionId),
  statusIdx: index('subscription_status_idx').on(table.status),
}));

// Subscription History (Track all changes to subscriptions)
export const subscriptionHistory = pgTable('subscription_history', {
  id: serial('id').primaryKey(),
  subscriptionId: integer('subscription_id')
    .notNull()
    .references(() => subscriptions.id),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),

  // What changed
  event: varchar('event', { length: 50 }).notNull(), // created, upgraded, downgraded, canceled, reactivated, expired
  fromPlanId: integer('from_plan_id')
    .references(() => subscriptionPlans.id),
  toPlanId: integer('to_plan_id')
    .references(() => subscriptionPlans.id),

  // Pricing changes
  fromPrice: decimal('from_price', { precision: 10, scale: 2 }),
  toPrice: decimal('to_price', { precision: 10, scale: 2 }),

  // Who made the change
  changedBy: integer('changed_by')
    .references(() => users.id),
  reason: text('reason'),

  // Metadata
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  subIdx: index('history_subscription_idx').on(table.subscriptionId),
  orgIdx: index('history_org_idx').on(table.organizationId),
  eventIdx: index('history_event_idx').on(table.event),
}));

// Invoices
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  subscriptionId: integer('subscription_id')
    .references(() => subscriptions.id),

  // Invoice details
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  status: paymentStatusEnum('status').notNull(),

  // Amounts
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),

  // Stripe references
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }).unique(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripePdfUrl: text('stripe_pdf_url'),

  // Dates
  issuedAt: timestamp('issued_at').notNull(),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  voidedAt: timestamp('voided_at'),

  // Line items (stored as JSON for flexibility)
  lineItems: jsonb('line_items').notNull().default('[]'),

  // Metadata
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orgIdx: index('invoice_org_idx').on(table.organizationId),
  stripeInvoiceIdx: index('invoice_stripe_idx').on(table.stripeInvoiceId),
  statusIdx: index('invoice_status_idx').on(table.status),
  issuedAtIdx: index('invoice_issued_idx').on(table.issuedAt),
}));

// Payment Methods
export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),

  // Payment method details
  type: varchar('type', { length: 50 }).notNull(), // card, bank_account, etc.
  isDefault: boolean('is_default').default(false).notNull(),

  // Card details (last 4 digits only for security)
  brand: varchar('brand', { length: 50 }), // visa, mastercard, etc.
  last4: varchar('last4', { length: 4 }),
  expMonth: integer('exp_month'),
  expYear: integer('exp_year'),

  // Bank account details (if applicable)
  bankName: varchar('bank_name', { length: 100 }),
  accountLast4: varchar('account_last4', { length: 4 }),

  // Stripe reference
  stripePaymentMethodId: varchar('stripe_payment_method_id', { length: 255 }).unique(),

  // User tracking
  addedBy: integer('added_by')
    .notNull()
    .references(() => users.id),

  // Metadata
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orgIdx: index('payment_method_org_idx').on(table.organizationId),
  stripeMethodIdx: index('payment_method_stripe_idx').on(table.stripePaymentMethodId),
}));

// Billing Events (Audit log for all billing activities)
export const billingEvents = pgTable('billing_events', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),

  // Event details
  eventType: varchar('event_type', { length: 100 }).notNull(), // subscription.created, invoice.paid, etc.
  eventSource: varchar('event_source', { length: 50 }).notNull(), // stripe_webhook, admin_action, system

  // Related entities
  subscriptionId: integer('subscription_id')
    .references(() => subscriptions.id),
  invoiceId: integer('invoice_id')
    .references(() => invoices.id),
  paymentMethodId: integer('payment_method_id')
    .references(() => paymentMethods.id),

  // Stripe reference
  stripeEventId: varchar('stripe_event_id', { length: 255 }),

  // Event data
  data: jsonb('data').notNull().default('{}'),

  // User tracking (if initiated by user)
  userId: integer('user_id')
    .references(() => users.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  orgIdx: index('billing_event_org_idx').on(table.organizationId),
  typeIdx: index('billing_event_type_idx').on(table.eventType),
  stripeEventIdx: index('billing_event_stripe_idx').on(table.stripeEventId),
  createdAtIdx: index('billing_event_created_idx').on(table.createdAt),
}));

// Usage Metrics (Track usage for usage-based billing)
export const usageMetrics = pgTable('usage_metrics', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),

  // Metric details
  metricType: varchar('metric_type', { length: 50 }).notNull(), // api_calls, storage, incidents, etc.
  metricValue: integer('metric_value').notNull(),
  metricUnit: varchar('metric_unit', { length: 20 }).notNull(), // count, gb, hours, etc.

  // Period
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),

  // Billing impact
  isBillable: boolean('is_billable').default(true).notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0'),

  // Metadata
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  orgIdx: index('usage_org_idx').on(table.organizationId),
  typeIdx: index('usage_type_idx').on(table.metricType),
  periodIdx: index('usage_period_idx').on(table.periodStart, table.periodEnd),
}));

// Discounts and Coupons
export const discounts = pgTable('discounts', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),

  // Discount details
  type: varchar('type', { length: 20 }).notNull(), // percentage, fixed_amount
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),

  // Applicability
  appliesToPlans: jsonb('applies_to_plans').default('[]'), // Array of plan IDs, empty = all plans
  minimumAmount: decimal('minimum_amount', { precision: 10, scale: 2 }),

  // Usage limits
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0),
  maxUsesPerOrganization: integer('max_uses_per_organization').default(1),

  // Validity
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until'),

  // Stripe reference
  stripeCouponId: varchar('stripe_coupon_id', { length: 255 }),

  // Status
  isActive: boolean('is_active').default(true).notNull(),

  // Metadata
  metadata: jsonb('metadata').default('{}'),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex('unique_discount_code').on(table.code),
  stripeCouponIdx: index('discount_stripe_idx').on(table.stripeCouponId),
}));

// Applied Discounts (Track which discounts have been used)
export const appliedDiscounts = pgTable('applied_discounts', {
  id: serial('id').primaryKey(),
  discountId: integer('discount_id')
    .notNull()
    .references(() => discounts.id),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => teams.id),
  subscriptionId: integer('subscription_id')
    .references(() => subscriptions.id),
  invoiceId: integer('invoice_id')
    .references(() => invoices.id),

  // Applied details
  appliedAmount: decimal('applied_amount', { precision: 10, scale: 2 }).notNull(),

  // User tracking
  appliedBy: integer('applied_by')
    .notNull()
    .references(() => users.id),
  appliedAt: timestamp('applied_at').notNull().defaultNow(),
}, (table) => ({
  discountIdx: index('applied_discount_idx').on(table.discountId),
  orgIdx: index('applied_org_idx').on(table.organizationId),
}));

// Relations
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
  fromHistory: many(subscriptionHistory, { relationName: 'fromPlan' }),
  toHistory: many(subscriptionHistory, { relationName: 'toPlan' }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  organization: one(teams, {
    fields: [subscriptions.organizationId],
    references: [teams.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  createdBy: one(users, {
    fields: [subscriptions.createdBy],
    references: [users.id],
  }),
  history: many(subscriptionHistory),
  invoices: many(invoices),
  appliedDiscounts: many(appliedDiscounts),
}));

export const subscriptionHistoryRelations = relations(subscriptionHistory, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [subscriptionHistory.subscriptionId],
    references: [subscriptions.id],
  }),
  organization: one(teams, {
    fields: [subscriptionHistory.organizationId],
    references: [teams.id],
  }),
  fromPlan: one(subscriptionPlans, {
    fields: [subscriptionHistory.fromPlanId],
    references: [subscriptionPlans.id],
    relationName: 'fromPlan',
  }),
  toPlan: one(subscriptionPlans, {
    fields: [subscriptionHistory.toPlanId],
    references: [subscriptionPlans.id],
    relationName: 'toPlan',
  }),
  changedBy: one(users, {
    fields: [subscriptionHistory.changedBy],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(teams, {
    fields: [invoices.organizationId],
    references: [teams.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
  appliedDiscounts: many(appliedDiscounts),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
  organization: one(teams, {
    fields: [paymentMethods.organizationId],
    references: [teams.id],
  }),
  addedBy: one(users, {
    fields: [paymentMethods.addedBy],
    references: [users.id],
  }),
  billingEvents: many(billingEvents),
}));

export const billingEventsRelations = relations(billingEvents, ({ one }) => ({
  organization: one(teams, {
    fields: [billingEvents.organizationId],
    references: [teams.id],
  }),
  subscription: one(subscriptions, {
    fields: [billingEvents.subscriptionId],
    references: [subscriptions.id],
  }),
  invoice: one(invoices, {
    fields: [billingEvents.invoiceId],
    references: [invoices.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [billingEvents.paymentMethodId],
    references: [paymentMethods.id],
  }),
  user: one(users, {
    fields: [billingEvents.userId],
    references: [users.id],
  }),
}));

export const usageMetricsRelations = relations(usageMetrics, ({ one }) => ({
  organization: one(teams, {
    fields: [usageMetrics.organizationId],
    references: [teams.id],
  }),
}));

export const discountsRelations = relations(discounts, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [discounts.createdBy],
    references: [users.id],
  }),
  applied: many(appliedDiscounts),
}));

export const appliedDiscountsRelations = relations(appliedDiscounts, ({ one }) => ({
  discount: one(discounts, {
    fields: [appliedDiscounts.discountId],
    references: [discounts.id],
  }),
  organization: one(teams, {
    fields: [appliedDiscounts.organizationId],
    references: [teams.id],
  }),
  subscription: one(subscriptions, {
    fields: [appliedDiscounts.subscriptionId],
    references: [subscriptions.id],
  }),
  invoice: one(invoices, {
    fields: [appliedDiscounts.invoiceId],
    references: [invoices.id],
  }),
  appliedBy: one(users, {
    fields: [appliedDiscounts.appliedBy],
    references: [users.id],
  }),
}));

// Type exports
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type NewSubscriptionHistory = typeof subscriptionHistory.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type BillingEvent = typeof billingEvents.$inferSelect;
export type NewBillingEvent = typeof billingEvents.$inferInsert;
export type UsageMetric = typeof usageMetrics.$inferSelect;
export type NewUsageMetric = typeof usageMetrics.$inferInsert;
export type Discount = typeof discounts.$inferSelect;
export type NewDiscount = typeof discounts.$inferInsert;
export type AppliedDiscount = typeof appliedDiscounts.$inferSelect;
export type NewAppliedDiscount = typeof appliedDiscounts.$inferInsert;