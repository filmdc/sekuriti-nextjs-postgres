import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, users } from '@/lib/db/schema';
import { sql, eq, and, gte, desc } from 'drizzle-orm';

// GET /api/system-admin/billing/overview - Get billing overview
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Get subscription statistics
    const [subscriptionStats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${teams.subscriptionStatus} = 'active' THEN
          CASE
            WHEN ${teams.planName} = 'enterprise' THEN 299
            WHEN ${teams.planName} = 'professional' THEN 99
            WHEN ${teams.planName} = 'standard' THEN 29
            ELSE 0
          END
        END), 0) * 12`, // Annual revenue estimate
        activeSubscriptions: sql<number>`COUNT(CASE WHEN ${teams.subscriptionStatus} = 'active' THEN 1 END)`,
        trialSubscriptions: sql<number>`COUNT(CASE WHEN ${teams.status} = 'trial' THEN 1 END)`,
        canceledSubscriptions: sql<number>`COUNT(CASE WHEN ${teams.subscriptionStatus} = 'canceled' THEN 1 END)`,
        pastDueSubscriptions: sql<number>`COUNT(CASE WHEN ${teams.subscriptionStatus} = 'past_due' THEN 1 END)`,
      })
      .from(teams);

    // Get revenue by plan
    const revenueByPlan = await db
      .select({
        plan: teams.planName,
        count: sql<number>`COUNT(*)`,
        revenue: sql<number>`COUNT(*) * CASE
          WHEN ${teams.planName} = 'enterprise' THEN 299
          WHEN ${teams.planName} = 'professional' THEN 99
          WHEN ${teams.planName} = 'standard' THEN 29
          ELSE 0
        END`,
      })
      .from(teams)
      .where(eq(teams.subscriptionStatus, 'active'))
      .groupBy(teams.planName);

    // Get recent organizations for "transactions"
    const recentTransactions = await db
      .select({
        id: teams.id,
        name: teams.name,
        planName: teams.planName,
        subscriptionStatus: teams.subscriptionStatus,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .where(eq(teams.subscriptionStatus, 'active'))
      .orderBy(desc(teams.updatedAt))
      .limit(10);

    // Generate revenue history for past 6 months
    const revenueHistory = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const [monthData] = await db
        .select({
          subscriptions: sql<number>`COUNT(CASE WHEN ${teams.subscriptionStatus} = 'active' THEN 1 END)`,
          revenue: sql<number>`COALESCE(SUM(CASE WHEN ${teams.subscriptionStatus} = 'active' THEN
            CASE
              WHEN ${teams.planName} = 'enterprise' THEN 299
              WHEN ${teams.planName} = 'professional' THEN 99
              WHEN ${teams.planName} = 'standard' THEN 29
              ELSE 0
            END
          END), 0)`,
        })
        .from(teams)
        .where(and(
          gte(teams.createdAt, date)
        ));

      revenueHistory.push({
        month: monthName,
        revenue: monthData?.revenue || 0,
        subscriptions: monthData?.subscriptions || 0,
      });
    }

    // Calculate growth metrics
    const currentMonthRevenue = revenueHistory[revenueHistory.length - 1]?.revenue || 0;
    const lastMonthRevenue = revenueHistory[revenueHistory.length - 2]?.revenue || 0;
    const growthRate = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Calculate churn rate (simplified)
    const churnRate = subscriptionStats?.canceledSubscriptions > 0
      ? (subscriptionStats.canceledSubscriptions / (subscriptionStats.activeSubscriptions + subscriptionStats.canceledSubscriptions)) * 100
      : 0;

    const response = {
      totalRevenue: subscriptionStats?.totalRevenue || 0,
      activeSubscriptions: subscriptionStats?.activeSubscriptions || 0,
      churnRate: Math.round(churnRate * 100) / 100,
      growthRate: Math.round(growthRate * 100) / 100,
      revenueByPlan: revenueByPlan.map(plan => ({
        plan: plan.plan || 'unknown',
        revenue: plan.revenue || 0,
        count: plan.count || 0,
      })),
      revenueHistory,
      subscriptionStatus: [
        { status: 'Active', count: subscriptionStats?.activeSubscriptions || 0, color: '#10b981' },
        { status: 'Trialing', count: subscriptionStats?.trialSubscriptions || 0, color: '#3b82f6' },
        { status: 'Past Due', count: subscriptionStats?.pastDueSubscriptions || 0, color: '#f59e0b' },
        { status: 'Canceled', count: subscriptionStats?.canceledSubscriptions || 0, color: '#ef4444' },
      ],
      recentTransactions: recentTransactions.map(team => ({
        id: `inv_${team.id}_${new Date().getFullYear()}`,
        organization: team.name,
        amount: team.planName === 'enterprise' ? 299
               : team.planName === 'professional' ? 99
               : team.planName === 'standard' ? 29 : 0,
        status: team.subscriptionStatus === 'active' ? 'paid' : 'pending',
        date: team.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        plan: team.planName || 'standard',
      })),
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