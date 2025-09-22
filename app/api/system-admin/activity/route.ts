import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { activityLogs, users, teams, teamMembers } from '@/lib/db/schema';
import { eq, sql, desc, gte, lte, and, or, ilike } from 'drizzle-orm';

// GET /api/system-admin/activity - Get user activity logs
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const userId = searchParams.get('userId') || '';
    const teamId = searchParams.get('teamId') || '';

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (dateFrom) {
      conditions.push(gte(activityLogs.timestamp, new Date(dateFrom)));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(activityLogs.timestamp, endDate));
    }
    if (action && action !== 'all') {
      conditions.push(eq(activityLogs.action, action));
    }
    if (userId) {
      conditions.push(eq(activityLogs.userId, parseInt(userId)));
    }
    if (teamId) {
      conditions.push(eq(activityLogs.teamId, parseInt(teamId)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get date ranges for stats
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get stats
    const [statsResult] = await db
      .select({
        totalLogins: sql<number>`COUNT(CASE WHEN ${activityLogs.action} = 'SIGN_IN' AND ${activityLogs.timestamp} >= '${twentyFourHoursAgo.toISOString()}' THEN 1 END)`,
        failedLogins: sql<number>`COUNT(CASE WHEN ${activityLogs.action} = 'SIGN_IN_FAILED' AND ${activityLogs.timestamp} >= '${twentyFourHoursAgo.toISOString()}' THEN 1 END)`,
        activeUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${activityLogs.timestamp} >= '${twentyFourHoursAgo.toISOString()}' THEN ${activityLogs.userId} END)`,
        newSignups: sql<number>`COUNT(CASE WHEN ${activityLogs.action} = 'CREATE_ACCOUNT' AND ${activityLogs.timestamp} >= '${today.toISOString()}' THEN 1 END)`,
        passwordResets: sql<number>`COUNT(CASE WHEN ${activityLogs.action} IN ('UPDATE_PASSWORD', 'RESET_PASSWORD') AND ${activityLogs.timestamp} >= '${sevenDaysAgo.toISOString()}' THEN 1 END)`,
      })
      .from(activityLogs);

    // Get activity logs with user and team info
    const activities = await db
      .select({
        id: activityLogs.id,
        userId: activityLogs.userId,
        userName: users.name,
        userEmail: users.email,
        action: activityLogs.action,
        ipAddress: activityLogs.ipAddress,
        userAgent: sql<string>`''`, // Not currently stored, placeholder
        teamId: activityLogs.teamId,
        teamName: teams.name,
        timestamp: activityLogs.timestamp,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .leftJoin(teams, eq(activityLogs.teamId, teams.id))
      .where(whereClause)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(activityLogs)
      .where(whereClause);

    // Transform activities to match expected format
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      userId: activity.userId,
      userName: activity.userName || 'Unknown',
      userEmail: activity.userEmail || 'unknown@example.com',
      action: activity.action,
      ipAddress: activity.ipAddress || 'Unknown',
      userAgent: activity.userAgent || 'Unknown',
      organizationId: activity.teamId,
      organizationName: activity.teamName || 'Unknown',
      success: !activity.action.includes('FAILED'),
      timestamp: activity.timestamp,
    }));

    // Get security alerts (suspicious activities)
    const securityAlerts = [];

    // Check for multiple failed logins from same IP
    const [failedLoginsByIP] = await db
      .select({
        ipAddress: activityLogs.ipAddress,
        count: sql<number>`COUNT(*)`,
      })
      .from(activityLogs)
      .where(and(
        eq(activityLogs.action, 'SIGN_IN_FAILED'),
        gte(activityLogs.timestamp, twentyFourHoursAgo)
      ))
      .groupBy(activityLogs.ipAddress)
      .having(sql`COUNT(*) >= 3`)
      .limit(1);

    if (failedLoginsByIP) {
      securityAlerts.push({
        type: 'failed_logins',
        message: `Multiple failed login attempts from IP ${failedLoginsByIP.ipAddress}`,
        count: failedLoginsByIP.count,
      });
    }

    // Check for unusual login times (example: logins between 2 AM and 5 AM)
    const [unusualTimeLogins] = await db
      .select({
        userEmail: users.email,
        timestamp: activityLogs.timestamp,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(and(
        eq(activityLogs.action, 'SIGN_IN'),
        gte(activityLogs.timestamp, twentyFourHoursAgo),
        sql`EXTRACT(hour FROM ${activityLogs.timestamp}) BETWEEN 2 AND 5`
      ))
      .limit(1);

    if (unusualTimeLogins) {
      securityAlerts.push({
        type: 'unusual_time',
        message: `Unusual login time detected for user ${unusualTimeLogins.userEmail}`,
        timestamp: unusualTimeLogins.timestamp,
      });
    }

    return NextResponse.json({
      activities: formattedActivities,
      stats: {
        totalLogins: statsResult?.totalLogins || 0,
        failedLogins: statsResult?.failedLogins || 0,
        activeUsers: statsResult?.activeUsers || 0,
        newSignups: statsResult?.newSignups || 0,
        passwordResets: statsResult?.passwordResets || 0,
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((countResult?.count || 0) / limit),
        totalItems: countResult?.count || 0,
      },
      securityAlerts,
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
});