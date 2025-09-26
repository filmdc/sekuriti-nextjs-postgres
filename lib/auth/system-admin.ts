import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users, ActivityType } from '@/lib/db/schema';
import { systemAuditLogs } from '@/lib/db/schema-system';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Check if the current user is a system admin
export async function isSystemAdmin(userId?: number): Promise<boolean> {
  if (!userId) {
    const currentUser = await getUser();
    if (!currentUser) return false;
    userId = currentUser.id;
  }

  const [user] = await db
    .select({ isSystemAdmin: users.isSystemAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.isSystemAdmin === true;
}

// Middleware to protect system admin routes
export async function requireSystemAdmin() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const isAdmin = await isSystemAdmin(user.id);

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return user;
}

// Wrapper for system admin API routes
export function withSystemAdmin(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    try {
      const user = await getUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const isAdmin = await isSystemAdmin(user.id);

      if (!isAdmin) {
        // Log unauthorized access attempt
        await logSystemAction({
          userId: user.id,
          action: 'UNAUTHORIZED_SYSTEM_ACCESS',
          metadata: {
            path: req.nextUrl.pathname,
            method: req.method,
          },
        });

        return NextResponse.json(
          { error: 'System admin access required' },
          { status: 403 }
        );
      }

      // Pass context through as-is, adding user info
      // Handlers will deal with awaiting params if needed
      const enhancedContext = {
        params: context?.params || context,
        user,
        isSystemAdmin: true
      };

      return handler(req, enhancedContext);
    } catch (error) {
      console.error('System admin middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// System admin action validation wrapper
export function validatedSystemAdminAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: (data: z.infer<S>, user: any) => Promise<T>
) {
  return async (prevState: any, formData: FormData) => {
    const user = await requireSystemAdmin();

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    try {
      return await action(result.data, user);
    } catch (error) {
      console.error('System admin action error:', error);
      return { error: 'An error occurred while processing your request' };
    }
  };
}

// Log system admin actions for audit trail
export async function logSystemAction({
  userId,
  action,
  entityType,
  entityId,
  organizationId,
  changes,
  metadata,
}: {
  userId: number;
  action: string;
  entityType?: string;
  entityId?: number;
  organizationId?: number;
  changes?: any;
  metadata?: any;
}) {
  try {
    const ipAddress = (await cookies()).get('cf-connecting-ip')?.value ||
                     (await cookies()).get('x-forwarded-for')?.value ||
                     'unknown';

    await db.insert(systemAuditLogs).values({
      userId,
      action,
      entityType,
      entityId,
      organizationId,
      changes: changes ? JSON.stringify(changes) : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress,
      userAgent: (await cookies()).get('user-agent')?.value || 'unknown',
    });
  } catch (error) {
    console.error('Failed to log system action:', error);
    // Don't throw - logging failures shouldn't break the action
  }
}

// Check if a user can impersonate another user
export async function canImpersonate(
  adminUserId: number,
  targetUserId: number
): Promise<boolean> {
  // System admins can impersonate anyone except other system admins
  const isAdmin = await isSystemAdmin(adminUserId);
  if (!isAdmin) return false;

  const isTargetAdmin = await isSystemAdmin(targetUserId);
  return !isTargetAdmin;
}

// Create an impersonation session
export async function createImpersonationSession(
  adminUserId: number,
  targetUserId: number,
  organizationId: number
) {
  if (!(await canImpersonate(adminUserId, targetUserId))) {
    throw new Error('Cannot impersonate this user');
  }

  // Log the impersonation
  await logSystemAction({
    userId: adminUserId,
    action: ActivityType.IMPERSONATE_USER,
    entityType: 'user',
    entityId: targetUserId,
    organizationId,
    metadata: {
      targetUserId,
      timestamp: new Date().toISOString(),
    },
  });

  // Create a special impersonation token
  // This should be handled carefully to maintain security
  const impersonationToken = {
    realUserId: adminUserId,
    impersonatedUserId: targetUserId,
    organizationId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  };

  return impersonationToken;
}

// Get system admin dashboard stats
export async function getSystemStats() {
  const [
    totalOrgs,
    activeOrgs,
    totalUsers,
    systemAdmins,
  ] = await Promise.all([
    db.select({ count: users.id }).from(users),
    // Add more queries as needed
  ]);

  return {
    organizations: {
      total: totalOrgs,
      active: activeOrgs,
    },
    users: {
      total: totalUsers,
      systemAdmins,
    },
  };
}