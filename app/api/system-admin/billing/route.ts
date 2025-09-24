import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, users } from '@/lib/db/schema';
import {
  subscriptionPlans,
  subscriptions,
  invoices,
  paymentMethods,
  billingEvents,
  usageMetrics
} from '@/lib/db/schema-billing';
import { sql, eq, and, gte, desc, lte, ne, inArray } from 'drizzle-orm';

// GET /api/system-admin/billing - Get billing overview
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Get all active subscriptions with plan details
    const activeSubscriptionsData = await db
      .select({
        subscription: subscriptions,
        plan: subscriptionPlans,
        team: teams,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .leftJoin(teams, eq(subscriptions.organizationId, teams.id))
      .where(eq(subscriptions.status, 'active'));

    // Get subscription statistics
    const [subscriptionStats] = await db
      .select({
        totalActive: sql<number>`CAST(COUNT(CASE WHEN ${subscriptions.status} = 'active' THEN 1 END) AS INTEGER)`,
        totalTrialing: sql<number>`CAST(COUNT(CASE WHEN ${subscriptions.status} = 'trialing' THEN 1 END) AS INTEGER)`,
        totalCanceled: sql<number>`CAST(COUNT(CASE WHEN ${subscriptions.status} = 'canceled' THEN 1 END) AS INTEGER)`,
        totalPastDue: sql<number>`CAST(COUNT(CASE WHEN ${subscriptions.status} = 'past_due' THEN 1 END) AS INTEGER)`,
      })
      .from(subscriptions);

    // Calculate MRR from active subscriptions
    const mrr = activeSubscriptionsData.reduce((total, item) => {
      if (item.plan) {
        const amount = item.subscription.billingInterval === 'monthly'
          ? parseFloat(item.plan.monthlyPrice)
          : parseFloat(item.plan.yearlyPrice) / 12;
        return total + amount;
      }
      return total;
    }, 0);

    // Get revenue by plan
    const revenueByPlanData = await db
      .select({
        planName: subscriptionPlans.name,
        planType: subscriptionPlans.type,
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        monthlyRevenue: sql<number>`
          CAST(SUM(
            CASE
              WHEN ${subscriptions.billingInterval} = 'monthly' THEN ${subscriptionPlans.monthlyPrice}
              ELSE ${subscriptionPlans.yearlyPrice} / 12
            END
          ) AS DECIMAL(10,2))`,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.status, 'active'))
      .groupBy(subscriptionPlans.id, subscriptionPlans.name, subscriptionPlans.type);

    // Get recent invoices
    const recentInvoices = await db
      .select({
        invoice: invoices,
        team: teams,
        subscription: subscriptions,
      })
      .from(invoices)
      .leftJoin(subscriptions, eq(invoices.subscriptionId, subscriptions.id))
      .leftJoin(teams, eq(subscriptions.organizationId, teams.id))
      .orderBy(desc(invoices.createdAt))
      .limit(10);

    // Get billing events for the current month
    const monthlyEvents = await db
      .select({
        eventType: billingEvents.eventType,
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(billingEvents)
      .where(
        and(
          gte(billingEvents.createdAt, startOfMonth),
          lte(billingEvents.createdAt, endOfMonth)
        )
      )
      .groupBy(billingEvents.eventType);

    // Generate revenue history for past 6 months
    const revenueHistory = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

      const [monthData] = await db
        .select({
          revenue: sql<number>`
            CAST(COALESCE(SUM(${invoices.amount}), 0) AS DECIMAL(10,2))`,
          invoiceCount: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.status, 'succeeded'),
            gte(invoices.createdAt, monthStart),
            lte(invoices.createdAt, monthEnd)
          )
        );

      revenueHistory.push({
        month: monthName,
        revenue: parseFloat(monthData?.revenue || '0'),
        subscriptions: monthData?.invoiceCount || 0,
      });
    }

    // Calculate growth metrics
    const currentMonthRevenue = revenueHistory[revenueHistory.length - 1]?.revenue || 0;
    const lastMonthRevenue = revenueHistory[revenueHistory.length - 2]?.revenue || 0;
    const growthRate = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Calculate churn rate
    const totalSubscriptions = (subscriptionStats?.totalActive || 0) + (subscriptionStats?.totalCanceled || 0);
    const churnRate = totalSubscriptions > 0
      ? (subscriptionStats?.totalCanceled / totalSubscriptions) * 100
      : 0;

    // Get usage metrics for current month
    const [currentMonthUsage] = await db
      .select({
        totalApiCalls: sql<number>`CAST(SUM(${usageMetrics.value}) AS INTEGER)`,
        uniqueTeams: sql<number>`CAST(COUNT(DISTINCT ${usageMetrics.organizationId}) AS INTEGER)`,
      })
      .from(usageMetrics)
      .where(
        and(
          eq(usageMetrics.metricType, 'api_calls'),
          gte(usageMetrics.recordedAt, startOfMonth)
        )
      );

    const response = {
      totalRevenue: Math.round(mrr * 12), // ARR
      activeSubscriptions: subscriptionStats?.totalActive || 0,
      churnRate: Math.round(churnRate * 100) / 100,
      growthRate: Math.round(growthRate * 100) / 100,
      mrr: Math.round(mrr),
      revenueByPlan: revenueByPlanData.map(plan => ({
        plan: plan.planName || 'Unknown',
        type: plan.planType || 'standard',
        revenue: parseFloat(plan.monthlyRevenue || '0'),
        count: plan.count || 0,
      })),
      revenueHistory,
      subscriptionStatus: [
        { status: 'Active', count: subscriptionStats?.totalActive || 0, color: '#10b981' },
        { status: 'Trialing', count: subscriptionStats?.totalTrialing || 0, color: '#3b82f6' },
        { status: 'Past Due', count: subscriptionStats?.totalPastDue || 0, color: '#f59e0b' },
        { status: 'Canceled', count: subscriptionStats?.totalCanceled || 0, color: '#ef4444' },
      ],
      recentTransactions: recentInvoices.map(item => ({
        id: item.invoice.invoiceNumber || `inv_${item.invoice.id}`,
        organization: item.team?.name || 'Unknown',
        amount: parseFloat(item.invoice.amount),
        status: item.invoice.status,
        date: item.invoice.createdAt.toISOString().split('T')[0],
        plan: item.subscription?.planId ? `Plan ${item.subscription.planId}` : 'Unknown',
      })),
      billingEvents: monthlyEvents.reduce((acc, event) => {
        acc[event.eventType] = event.count;
        return acc;
      }, {} as Record<string, number>),
      usage: {
        apiCalls: currentMonthUsage?.totalApiCalls || 0,
        activeTeams: currentMonthUsage?.uniqueTeams || 0,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching billing overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing overview' },
      { status: 500 }
    );
  }
});