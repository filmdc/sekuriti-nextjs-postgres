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

    // Get organization count - simple count
    const [orgCount] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(teams);

    // Get active organizations
    const [activeOrgs] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(teams)
      .where(eq(teams.status, 'active'));

    // Get trial organizations
    const [trialOrgs] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(teams)
      .where(eq(teams.status, 'trial'));

    // Get new organizations this month
    const [newOrgsMonth] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(teams)
      .where(gte(teams.createdAt, startOfMonth));

    // Get user count
    const [userCount] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(users);

    // Get verified users (have logged in)
    const [verifiedUsers] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(users)
      .where(sql`last_login_at IS NOT NULL`);

    // Get system admins
    const [systemAdmins] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(users)
      .where(eq(users.isSystemAdmin, true));

    // Get new users this month
    const [newUsersMonth] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(users)
      .where(gte(users.createdAt, startOfMonth));

    // Get active subscriptions
    const [activeSubscriptions] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(teams)
      .where(eq(teams.subscriptionStatus, 'active'));

    // Calculate MRR
    const [mrrData] = await db
      .select({
        mrr: sql<number>`CAST(SUM(CASE
          WHEN subscription_status = 'active' AND plan_name = 'enterprise' THEN 299
          WHEN subscription_status = 'active' AND plan_name = 'professional' THEN 99
          WHEN subscription_status = 'active' AND plan_name = 'standard' THEN 29
          ELSE 0
        END) AS INTEGER)`,
      })
      .from(teams);

    // Get incident count
    const [incidentCount] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(incidents);

    // Get active incidents
    const [activeIncidents] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(incidents)
      .where(sql`status != 'closed'`);

    // Get today's login count
    const [todayLogins] = await db
      .select({
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`
      })
      .from(activityLogs)
      .where(and(
        eq(activityLogs.action, 'SIGN_IN' as any),
        gte(activityLogs.timestamp, startOfToday)
      ));

    // Get weekly active users
    const [weeklyActive] = await db
      .select({
        count: sql<number>`CAST(COUNT(DISTINCT user_id) AS INTEGER)`
      })
      .from(activityLogs)
      .where(gte(activityLogs.timestamp, startOfWeek));

    // Prepare response
    const responseData = {
      organizations: orgCount?.count || 0,
      users: userCount?.count || 0,
      activeSubscriptions: activeSubscriptions?.count || 0,
      incidents: incidentCount?.count || 0,
      revenue: {
        mrr: mrrData?.mrr || 0,
        total: (mrrData?.mrr || 0) * 12, // Annual recurring revenue
        growth: 0, // Simplified for now
      },
      activity: {
        todayLogins: todayLogins?.count || 0,
        weeklyActiveUsers: weeklyActive?.count || 0,
        newUsersThisMonth: newUsersMonth?.count || 0,
      },
    };

    console.log('Returning stats response:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system statistics' },
      { status: 500 }
    );
  }
});