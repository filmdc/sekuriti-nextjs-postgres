import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { activityLogs, teamMembers, users } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 50;
    const offset = (page - 1) * limit;
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Build where conditions
    const conditions = [eq(activityLogs.teamId, organizationId)];

    if (from) {
      conditions.push(gte(activityLogs.timestamp, new Date(from)));
    }
    if (to) {
      conditions.push(lte(activityLogs.timestamp, new Date(to)));
    }

    // Fetch activity logs with user details
    const logs = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        userId: activityLogs.userId,
        userName: users.name,
        userEmail: users.email,
        timestamp: activityLogs.timestamp,
        ipAddress: activityLogs.ipAddress
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(activityLogs)
      .where(and(...conditions));

    const totalPages = Math.ceil((totalCount.count || 0) / limit);

    return NextResponse.json({
      logs,
      page,
      totalPages,
      totalCount: totalCount.count || 0
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}