import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { systemAuditLogs } from '@/lib/db/schema-system';
import { users, teams } from '@/lib/db/schema';
import { eq, desc, gte, sql } from 'drizzle-orm';

// GET /api/system-admin/monitoring/audit - Get system audit logs
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    // Get logs from the last 30 days by default
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch audit logs with user and organization details
    const logs = await db
      .select({
        id: systemAuditLogs.id,
        userId: systemAuditLogs.userId,
        userName: users.name,
        userEmail: users.email,
        action: systemAuditLogs.action,
        entityType: systemAuditLogs.entityType,
        entityId: systemAuditLogs.entityId,
        organizationId: systemAuditLogs.organizationId,
        organizationName: teams.name,
        metadata: systemAuditLogs.metadata,
        changes: systemAuditLogs.changes,
        ipAddress: systemAuditLogs.ipAddress,
        createdAt: systemAuditLogs.createdAt,
      })
      .from(systemAuditLogs)
      .leftJoin(users, eq(systemAuditLogs.userId, users.id))
      .leftJoin(teams, eq(systemAuditLogs.organizationId, teams.id))
      .where(gte(systemAuditLogs.createdAt, thirtyDaysAgo))
      .orderBy(desc(systemAuditLogs.createdAt))
      .limit(1000); // Limit to prevent overwhelming the client

    // Parse JSON fields
    const parsedLogs = logs.map(log => ({
      ...log,
      metadata: log.metadata ? (typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata) : {},
      changes: log.changes ? (typeof log.changes === 'string' ? JSON.parse(log.changes) : log.changes) : null,
    }));

    return NextResponse.json({
      logs: parsedLogs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
});