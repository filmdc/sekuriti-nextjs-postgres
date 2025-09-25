import { db } from './drizzle';
import { teams, users } from './schema';
import {
  subscriptionPlans,
  subscriptions,
  invoices,
  paymentMethods,
  billingEvents,
  usageMetrics,
  discounts,
} from './schema-billing';
import { eq } from 'drizzle-orm';

export async function seedBillingData() {
  console.log('🌱 Seeding billing data...');

  try {
    // Step 1: Check if plans exist, if not create them
    let plans = await db.select().from(subscriptionPlans);

    if (plans.length === 0) {
      console.log('Creating subscription plans...');
      plans = await db.insert(subscriptionPlans).values([
      {
        name: 'Standard',
        displayName: 'Standard Plan',
        description: 'Essential incident response features for small teams',
        type: 'standard' as const,
        monthlyPrice: '29.00',
        yearlyPrice: '290.00',
        features: {
          incidents: 'Unlimited',
          users: 'Up to 10',
          assets: 'Up to 100',
          support: 'Email support',
          retention: '30 days',
        },
        maxUsers: 10,
        maxIncidents: 100,
        maxAssets: 100,
        maxRunbooks: 20,
        maxStorageGb: 10,
        isActive: true,
      },
      {
        name: 'Professional',
        displayName: 'Professional Plan',
        description: 'Advanced features for growing security teams',
        type: 'professional' as const,
        monthlyPrice: '99.00',
        yearlyPrice: '990.00',
        features: {
          incidents: 'Unlimited',
          users: 'Up to 50',
          assets: 'Up to 1000',
          support: 'Priority support',
          retention: '90 days',
          automation: 'Basic automation',
          integrations: 'Advanced integrations',
        },
        maxUsers: 50,
        maxIncidents: 500,
        maxAssets: 1000,
        maxRunbooks: 100,
        maxStorageGb: 50,
        isActive: true,
      },
      {
        name: 'Enterprise',
        displayName: 'Enterprise Plan',
        description: 'Complete solution for enterprise security operations',
        type: 'enterprise' as const,
        monthlyPrice: '299.00',
        yearlyPrice: '2990.00',
        features: {
          incidents: 'Unlimited',
          users: 'Unlimited',
          assets: 'Unlimited',
          support: '24/7 phone & email',
          retention: 'Unlimited',
          automation: 'Advanced automation',
          integrations: 'All integrations',
          compliance: 'Compliance reporting',
          sso: 'SSO/SAML',
          api: 'Full API access',
        },
        maxUsers: 999999,
        maxIncidents: 999999,
        maxAssets: 999999,
        maxRunbooks: 999999,
        maxStorageGb: 999999,
        isActive: true,
      },
    ]).returning();

      console.log(`✅ Created ${plans.length} subscription plans`);
    } else {
      console.log(`✅ Found existing ${plans.length} subscription plans`);
    }

    // Step 2: Get a system admin user to use as created_by
    const [systemAdmin] = await db.select().from(users).where(eq(users.isSystemAdmin, true)).limit(1);
    const systemAdminId = systemAdmin?.id || 1; // Default to 1 if not found

    // Step 3: Get existing teams and create subscriptions for them
    const allTeams = await db.select().from(teams);

    // Map teams to appropriate plans based on their current status
    const subscriptionsToCreate = [];
    const now = new Date();

    // Check for existing subscriptions to avoid duplicates
    const existingSubscriptions = await db
      .select({ organizationId: subscriptions.organizationId })
      .from(subscriptions);

    const existingOrgIds = new Set(existingSubscriptions.map(s => s.organizationId));

    for (const team of allTeams) {
      // Skip teams that might not need subscriptions or already have one
      if (!team.id || existingOrgIds.has(team.id)) continue;

      // Determine plan based on team's current plan name or status
      let planId = plans[0].id; // Default to Standard
      let status: 'active' | 'trialing' | 'past_due' | 'canceled' = 'active';

      if (team.planName === 'enterprise') {
        planId = plans[2].id;
      } else if (team.planName === 'professional') {
        planId = plans[1].id;
      }

      if (team.status === 'trial') {
        status = 'trialing';
      } else if (team.subscriptionStatus === 'canceled') {
        status = 'canceled';
      } else if (team.subscriptionStatus === 'past_due') {
        status = 'past_due';
      }

      // Get the plan to get pricing info
      const plan = plans.find(p => p.id === planId);
      const price = plan?.monthlyPrice || '29.00';

      // Create subscription
      const subscription = await db.insert(subscriptions).values({
        organizationId: team.id,
        planId: planId,
        status: status,
        billingInterval: 'monthly' as const,
        price: price,
        startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        currentPeriodStart: new Date(now.getFullYear(), now.getMonth(), 1),
        currentPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        canceledAt: status === 'canceled' ? now : null,
        stripeSubscriptionId: team.stripeSubscriptionId || `sub_test_${team.id}`,
        stripeCustomerId: team.stripeCustomerId || `cus_test_${team.id}`,
        createdBy: systemAdminId,
      }).returning();

      subscriptionsToCreate.push(subscription[0]);

      // Create some invoices for active subscriptions
      if (status === 'active' && subscription[0]) {
        // Create past invoices (3 months)
        for (let i = 3; i >= 1; i--) {
          const invoiceDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const plan = plans.find(p => p.id === planId);
          const amount = plan?.monthlyPrice || '29.00';

          await db.insert(invoices).values({
            organizationId: team.id,
            subscriptionId: subscription[0].id,
            invoiceNumber: `INV-${team.id}-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`,
            subtotal: amount,
            total: amount,
            currency: 'usd',
            status: 'succeeded' as const,
            issuedAt: invoiceDate,
            dueDate: new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 10),
            paidAt: new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 5),
            stripeInvoiceId: `in_test_${team.id}_${i}`,
            createdAt: invoiceDate,
          });
        }

        // Create current month invoice (pending or succeeded)
        const currentInvoiceStatus = Math.random() > 0.5 ? 'succeeded' : 'pending';
        const currentAmount = plans.find(p => p.id === planId)?.monthlyPrice || '29.00';
        await db.insert(invoices).values({
          organizationId: team.id,
          subscriptionId: subscription[0].id,
          invoiceNumber: `INV-${team.id}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`,
          subtotal: currentAmount,
          total: currentAmount,
          currency: 'usd',
          status: currentInvoiceStatus as 'succeeded' | 'pending',
          issuedAt: new Date(now.getFullYear(), now.getMonth(), 1),
          dueDate: new Date(now.getFullYear(), now.getMonth(), 10),
          paidAt: currentInvoiceStatus === 'succeeded' ? now : null,
          stripeInvoiceId: `in_test_${team.id}_current`,
        });
      }

      // Add payment method for active teams
      if (status === 'active' || status === 'trialing') {
        await db.insert(paymentMethods).values({
          organizationId: team.id,
          type: 'card',
          last4: String(1000 + Math.floor(Math.random() * 9000)),
          brand: ['visa', 'mastercard', 'amex'][Math.floor(Math.random() * 3)],
          expMonth: Math.floor(Math.random() * 12) + 1,
          expYear: now.getFullYear() + Math.floor(Math.random() * 5) + 1,
          isDefault: true,
          stripePaymentMethodId: `pm_test_${team.id}`,
          addedBy: systemAdminId,
        });
      }

      // Create billing events
      await db.insert(billingEvents).values([
        {
          organizationId: team.id,
          eventType: 'subscription_created',
          eventSource: 'system',
          data: { planId, status, teamName: team.name },
          createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 15),
        },
      ]);

      // Add some usage metrics
      for (let i = 0; i < 7; i++) {
        const metricDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        await db.insert(usageMetrics).values({
          organizationId: team.id,
          metricType: 'api_calls',
          metricValue: Math.floor(Math.random() * 1000) + 100,
          metricUnit: 'count',
          periodStart: metricDate,
          periodEnd: metricDate,
          isBillable: false,
          createdAt: metricDate,
        });
      }
    }

    console.log(`✅ Created ${subscriptionsToCreate.length} subscriptions with invoices`);

    // Step 3: Create some discounts
    const discountsCreated = await db.insert(discounts).values([
      {
        code: 'LAUNCH20',
        name: 'Launch Month Special',
        description: '20% off for launch month',
        type: 'percentage',
        value: '20.00',
        maxUses: 100,
        currentUses: 15,
        validFrom: new Date(now.getFullYear(), now.getMonth(), 1),
        validUntil: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        isActive: true,
        createdBy: systemAdminId,
      },
      {
        code: 'SECURITY10',
        name: 'Security Special',
        description: '$10 off monthly subscription',
        type: 'fixed_amount',
        value: '10.00',
        maxUses: 50,
        currentUses: 5,
        validFrom: now,
        validUntil: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        isActive: true,
        createdBy: systemAdminId,
      },
    ]).returning();

    console.log(`✅ Created ${discountsCreated.length} discount codes`);

    // Add some recent billing events for activity
    const recentEvents = [
      'subscription_updated',
      'payment_succeeded',
      'invoice_created',
      'payment_method_added',
    ] as const;

    for (const team of allTeams.slice(0, 5)) {
      if (!team.id) continue;

      for (const eventType of recentEvents) {
        await db.insert(billingEvents).values({
          organizationId: team.id,
          eventType,
          eventSource: 'stripe_webhook',
          data: { teamName: team.name, event: eventType },
          createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    console.log('✅ Billing data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding billing data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedBillingData()
    .then(() => {
      console.log('✅ Billing seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Billing seed failed:', error);
      process.exit(1);
    });
}