import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, users, activityLogs } from '@/lib/db/schema';
import { incidents } from '@/lib/db/schema-ir';
import { sql, eq, gte, and } from 'drizzle-orm';

// GET /api/system-admin/stats - Get system statistics
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get organization count
    const [orgStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`COUNT(CASE WHEN ${teams.status} = 'active' THEN 1 END)`,
        trial: sql<number>`COUNT(CASE WHEN ${teams.status} = 'trial' THEN 1 END)`,
        newThisMonth: sql<number>`COUNT(CASE WHEN ${teams.createdAt} >= '${startOfMonth.toISOString()}' THEN 1 END)`,
      })
      .from(teams);

    // Get user count
    const [userStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        verified: sql<number>`COUNT(CASE WHEN ${users.emailVerified} = true THEN 1 END)`,
        systemAdmins: sql<number>`COUNT(CASE WHEN ${users.isSystemAdmin} = true THEN 1 END)`,
        newThisMonth: sql<number>`COUNT(CASE WHEN ${users.createdAt} >= '${startOfMonth.toISOString()}' THEN 1 END)`,
      })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`);

    // Get subscription stats
    const [subscriptionStats] = await db
      .select({
        active: sql<number>`COUNT(CASE WHEN ${teams.subscriptionStatus} = 'active' THEN 1 END)`,
        trial: sql<number>`COUNT(CASE WHEN ${teams.status} = 'trial' THEN 1 END)`,
        mrr: sql<number>`SUM(CASE 
          WHEN ${teams.subscriptionStatus} = 'active' AND ${teams.planName} = 'enterprise' THEN 299
          WHEN ${teams.subscriptionStatus} = 'active' AND ${teams.planName} = 'professional' THEN 99
          WHEN ${teams.subscriptionStatus} = 'active' AND ${teams.planName} = 'standard' THEN 29
          ELSE 0
        END)`,
      })
      .from(teams);

    // Get incident count
    const [incidentStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`COUNT(CASE WHEN ${incidents.status} != 'closed' THEN 1 END)`,
        thisMonth: sql<number>`COUNT(CASE WHEN ${incidents.detectedAt} >= '${startOfMonth.toISOString()}' THEN 1 END)`,
      })
      .from(incidents);

    // Get activity stats
    const [activityStats] = await db
      .select({
        todayLogins: sql<number>`COUNT(CASE WHEN ${activityLogs.action} = 'SIGN_IN' AND ${activityLogs.timestamp} >= '${startOfToday.toISOString()}' THEN 1 END)`,
        weeklyActiveUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${activityLogs.timestamp} >= '${startOfWeek.toISOString()}' THEN ${activityLogs.userId} END)`,
      })
      .from(activityLogs);

    // Calculate revenue growth (simplified)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [lastMonthRevenue] = await db
      .select({
        mrr: sql<number>`SUM(CASE 
          WHEN ${teams.subscriptionStatus} = 'active' AND ${teams.planName} = 'enterprise' THEN 299
          WHEN ${teams.subscriptionStatus} = 'active' AND ${teams.planName} = 'professional' THEN 99
          WHEN ${teams.subscriptionStatus} = 'active' AND ${teams.planName} = 'standard' THEN 29
          ELSE 0
        END)`,
      })
      .from(teams)
      .where(gte(teams.createdAt, lastMonth));

    const currentMrr = subscriptionStats?.mrr || 0;
    const previousMrr = lastMonthRevenue?.mrr || 0;
    const revenueGrowth = previousMrr > 0 ? ((currentMrr - previousMrr) / previousMrr) * 100 : 0;

    return NextResponse.json({
      organizations: orgStats?.total || 0,
      users: userStats?.total || 0,
      activeSubscriptions: subscriptionStats?.active || 0,
      incidents: incidentStats?.total || 0,
      revenue: {
        mrr: currentMrr,
        total: currentMrr * 12, // Annual recurring revenue
        growth: Math.round(revenueGrowth * 100) / 100,
      },
      activity: {
        todayLogins: activityStats?.todayLogins || 0,
        weeklyActiveUsers: activityStats?.weeklyActiveUsers || 0,
        newUsersThisMonth: userStats?.newThisMonth || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system statistics' },
      { status: 500 }
    );
  }
});
