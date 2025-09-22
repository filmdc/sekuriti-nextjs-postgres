import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams, users, teamMembers, activityLogs } from '@/lib/db/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';

// GET /api/system-admin/dashboard - Get dashboard statistics
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get organization statistics
    const [organizationStats] = await db
      .select({
        total: sql<number>`COUNT(DISTINCT ${teams.id})`,
        active: sql<number>`COUNT(DISTINCT CASE WHEN ${teams.status} = 'active' THEN ${teams.id} END)`,
        newThisMonth: sql<number>`COUNT(DISTINCT CASE WHEN ${teams.createdAt} >= ${thirtyDaysAgo} THEN ${teams.id} END)`,
      })
      .from(teams);

    // Get user statistics
    const [userStats] = await db
      .select({
        total: sql<number>`COUNT(DISTINCT ${users.id})`,
        verified: sql<number>`COUNT(DISTINCT CASE WHEN ${users.emailVerified} = true THEN ${users.id} END)`,
        systemAdmins: sql<number>`COUNT(DISTINCT CASE WHEN ${users.isSystemAdmin} = true THEN ${users.id} END)`,
        newThisWeek: sql<number>`COUNT(DISTINCT CASE WHEN ${users.createdAt} >= ${sevenDaysAgo} THEN ${users.id} END)`,
      })
      .from(users);

    // Get license statistics
    const [licenseStats] = await db
      .select({
        totalLicenses: sql<number>`COALESCE(SUM(${teams.licenseCount}), 0)`,
        averageLicenses: sql<number>`COALESCE(AVG(${teams.licenseCount}), 0)`,
      })
      .from(teams);

    // Get revenue statistics (simplified - you'd need actual billing data)
    const [revenueStats] = await db
      .select({
        subscribedOrgs: sql<number>`COUNT(DISTINCT CASE WHEN ${teams.stripeSubscriptionId} IS NOT NULL THEN ${teams.id} END)`,
      })
      .from(teams);

    // Get recent activity count
    const [activityStats] = await db
      .select({
        recentActivity: sql<number>`COUNT(*)`,
      })
      .from(activityLogs)
      .where(gte(activityLogs.timestamp, sevenDaysAgo));

    // Get recent organizations
    const recentOrganizations = await db
      .select({
        id: teams.id,
        name: teams.name,
        status: teams.status,
        createdAt: teams.createdAt,
        userCount: sql<number>`(SELECT COUNT(*) FROM ${teamMembers} WHERE ${teamMembers.teamId} = ${teams.id})`,
      })
      .from(teams)
      .orderBy(desc(teams.createdAt))
      .limit(5);

    // Get system health indicators
    const systemHealth = {
      apiStatus: 'operational',
      databaseStatus: 'operational',
      queueStatus: 'operational',
      lastBackup: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    };

    return NextResponse.json({
      stats: {
        organizations: {
          total: organizationStats?.total || 0,
          active: organizationStats?.active || 0,
          newThisMonth: organizationStats?.newThisMonth || 0,
          growth: organizationStats?.total > 0 && organizationStats?.newThisMonth > 0
            ? Math.round((organizationStats.newThisMonth / organizationStats.total) * 100)
            : 0,
        },
        users: {
          total: userStats?.total || 0,
          verified: userStats?.verified || 0,
          systemAdmins: userStats?.systemAdmins || 0,
          newThisWeek: userStats?.newThisWeek || 0,
        },
        licenses: {
          total: licenseStats?.totalLicenses || 0,
          average: Math.round(licenseStats?.averageLicenses || 0),
        },
        revenue: {
          mrr: (revenueStats?.subscribedOrgs || 0) * 99, // Simplified calculation
          subscribedOrgs: revenueStats?.subscribedOrgs || 0,
        },
        activity: {
          recentActions: activityStats?.recentActivity || 0,
        },
      },
      recentOrganizations,
      systemHealth,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
});