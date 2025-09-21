import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { incidents } from '@/lib/db/schema-ir';
import { eq, and, gte, count } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const memberRecord = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organizationId = memberRecord[0].teamId;

    // Fetch organization with Stripe details
    const [organization] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, organizationId));

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    let billingData: any = {
      subscription: null,
      paymentMethod: null,
      invoices: [],
      usage: {
        teamMembers: { current: 0, limit: 5 },
        incidents: { current: 0, limit: 10 },
        storage: { current: 0, limit: 5 }
      }
    };

    // Get current usage
    const [memberCount] = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, organizationId));

    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    const [incidentCount] = await db
      .select({ count: count() })
      .from(incidents)
      .where(
        and(
          eq(incidents.organizationId, organizationId),
          gte(incidents.createdAt, firstOfMonth)
        )
      );

    billingData.usage.teamMembers.current = memberCount.count || 0;
    billingData.usage.incidents.current = incidentCount.count || 0;
    billingData.usage.storage.current = Math.floor(Math.random() * 3); // Mock storage usage

    // If organization has Stripe subscription, fetch details
    if (organization.stripeCustomerId && organization.stripeSubscriptionId) {
      try {
        // Fetch subscription
        const subscription = await stripe.subscriptions.retrieve(
          organization.stripeSubscriptionId
        );

        billingData.subscription = {
          id: subscription.id,
          status: subscription.status,
          plan: organization.planName || 'Professional',
          amount: subscription.items.data[0]?.price.unit_amount || 0,
          interval: subscription.items.data[0]?.price.recurring?.interval || 'month',
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
        };

        // Update usage limits based on plan
        if (organization.planName === 'Starter') {
          billingData.usage.teamMembers.limit = 5;
          billingData.usage.incidents.limit = 10;
          billingData.usage.storage.limit = 5;
        } else if (organization.planName === 'Professional') {
          billingData.usage.teamMembers.limit = 20;
          billingData.usage.incidents.limit = -1; // Unlimited
          billingData.usage.storage.limit = 50;
        } else if (organization.planName === 'Enterprise') {
          billingData.usage.teamMembers.limit = -1; // Unlimited
          billingData.usage.incidents.limit = -1; // Unlimited
          billingData.usage.storage.limit = 500;
        }

        // Fetch payment method
        if (subscription.default_payment_method) {
          const paymentMethod = await stripe.paymentMethods.retrieve(
            subscription.default_payment_method as string
          );

          if (paymentMethod.card) {
            billingData.paymentMethod = {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              expMonth: paymentMethod.card.exp_month,
              expYear: paymentMethod.card.exp_year
            };
          }
        }

        // Fetch recent invoices
        const invoices = await stripe.invoices.list({
          customer: organization.stripeCustomerId,
          limit: 10
        });

        billingData.invoices = invoices.data.map(invoice => ({
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount_paid,
          status: invoice.status,
          date: new Date(invoice.created * 1000).toISOString(),
          pdfUrl: invoice.invoice_pdf
        }));
      } catch (stripeError) {
        console.error('Stripe API error:', stripeError);
        // Return partial data if Stripe fails
      }
    }

    return NextResponse.json(billingData);
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}