import { db } from './drizzle';
import { teams } from './schema';
import { invoices, subscriptions, subscriptionPlans } from './schema-billing';
import { eq } from 'drizzle-orm';

export async function seedInvoiceData() {
  console.log('🧾 Seeding invoice data...');

  try {
    // Get all teams with active subscriptions
    const activeSubscriptions = await db
      .select({
        subscription: subscriptions,
        team: teams,
        plan: subscriptionPlans,
      })
      .from(subscriptions)
      .leftJoin(teams, eq(subscriptions.organizationId, teams.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.status, 'active'));

    if (activeSubscriptions.length === 0) {
      console.log('No active subscriptions found. Creating sample data...');

      // Get all teams to create invoices for
      const allTeams = await db.select().from(teams).limit(5);

      for (const team of allTeams) {
        if (!team.id) continue;

        const now = new Date();
        const amounts = ['29.00', '99.00', '299.00'];

        // Create past invoices (6 months)
        for (let i = 6; i >= 1; i--) {
          const invoiceDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const amount = amounts[Math.floor(Math.random() * amounts.length)];
          const tax = (parseFloat(amount) * 0.1).toFixed(2);
          const total = (parseFloat(amount) + parseFloat(tax)).toFixed(2);

          await db.insert(invoices).values({
            organizationId: team.id,
            subscriptionId: null, // No subscription needed for demo
            invoiceNumber: `INV-${team.id}-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
            subtotal: amount,
            tax: tax,
            discount: '0.00',
            total: total,
            currency: 'USD',
            status: 'succeeded' as const,
            issuedAt: invoiceDate,
            dueDate: new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 15),
            paidAt: new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 10),
            stripeInvoiceId: `in_test_${team.id}_${i}_${Date.now()}`,
            lineItems: [
              {
                description: `Monthly subscription - ${team.name}`,
                amount: parseFloat(amount),
                quantity: 1,
              }
            ],
          });
        }

        // Create current month invoice (various statuses)
        const currentStatuses = ['pending', 'succeeded', 'failed'] as const;
        const currentStatus = currentStatuses[Math.floor(Math.random() * currentStatuses.length)];
        const currentAmount = amounts[Math.floor(Math.random() * amounts.length)];
        const currentTax = (parseFloat(currentAmount) * 0.1).toFixed(2);
        const currentTotal = (parseFloat(currentAmount) + parseFloat(currentTax)).toFixed(2);

        await db.insert(invoices).values({
          organizationId: team.id,
          subscriptionId: null,
          invoiceNumber: `INV-${team.id}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
          subtotal: currentAmount,
          tax: currentTax,
          discount: '0.00',
          total: currentTotal,
          currency: 'USD',
          status: currentStatus,
          issuedAt: new Date(now.getFullYear(), now.getMonth(), 1),
          dueDate: new Date(now.getFullYear(), now.getMonth(), 15),
          paidAt: currentStatus === 'succeeded' ? now : null,
          stripeInvoiceId: `in_test_${team.id}_current_${Date.now()}`,
          lineItems: [
            {
              description: `Monthly subscription - ${team.name}`,
              amount: parseFloat(currentAmount),
              quantity: 1,
            }
          ],
        });

        // Create a few overdue invoices
        if (Math.random() > 0.7) {
          const overdueDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
          const overdueAmount = amounts[Math.floor(Math.random() * amounts.length)];
          const overdueTax = (parseFloat(overdueAmount) * 0.1).toFixed(2);
          const overdueTotal = (parseFloat(overdueAmount) + parseFloat(overdueTax)).toFixed(2);

          await db.insert(invoices).values({
            organizationId: team.id,
            subscriptionId: null,
            invoiceNumber: `INV-${team.id}-OVERDUE-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
            subtotal: overdueAmount,
            tax: overdueTax,
            discount: '0.00',
            total: overdueTotal,
            currency: 'USD',
            status: 'pending',
            issuedAt: overdueDate,
            dueDate: new Date(overdueDate.getFullYear(), overdueDate.getMonth(), overdueDate.getDate() + 7), // Past due
            paidAt: null,
            stripeInvoiceId: `in_test_${team.id}_overdue_${Date.now()}`,
            lineItems: [
              {
                description: `Monthly subscription (Overdue) - ${team.name}`,
                amount: parseFloat(overdueAmount),
                quantity: 1,
              }
            ],
          });
        }
      }

      console.log(`✅ Created sample invoices for ${allTeams.length} teams`);
    } else {
      // Create invoices for existing subscriptions
      for (const sub of activeSubscriptions) {
        if (!sub.subscription || !sub.team) continue;

        const now = new Date();
        const amount = sub.plan?.monthlyPrice || '29.00';
        const tax = (parseFloat(amount) * 0.1).toFixed(2);
        const total = (parseFloat(amount) + parseFloat(tax)).toFixed(2);

        // Create past invoices (3 months)
        for (let i = 3; i >= 1; i--) {
          const invoiceDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

          await db.insert(invoices).values({
            organizationId: sub.subscription.organizationId,
            subscriptionId: sub.subscription.id,
            invoiceNumber: `INV-${sub.subscription.organizationId}-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
            subtotal: amount,
            tax: tax,
            discount: '0.00',
            total: total,
            currency: sub.subscription.currency || 'USD',
            status: 'succeeded' as const,
            issuedAt: invoiceDate,
            dueDate: new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 15),
            paidAt: new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), 10),
            stripeInvoiceId: `in_test_sub_${sub.subscription.id}_${i}_${Date.now()}`,
            lineItems: [
              {
                description: `${sub.plan?.displayName || 'Subscription'} - ${sub.team.name}`,
                amount: parseFloat(amount),
                quantity: 1,
              }
            ],
          });
        }

        console.log(`✅ Created invoices for subscription ${sub.subscription.id}`);
      }
    }

    // Get invoice count
    const invoiceCount = await db.select().from(invoices);
    console.log(`✅ Total invoices in database: ${invoiceCount.length}`);

  } catch (error) {
    console.error('❌ Error seeding invoice data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedInvoiceData()
    .then(() => {
      console.log('✅ Invoice seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Invoice seed failed:', error);
      process.exit(1);
    });
}