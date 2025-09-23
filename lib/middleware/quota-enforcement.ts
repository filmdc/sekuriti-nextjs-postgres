import { db } from '@/lib/db/drizzle';
import { organizationLimits } from '@/lib/db/schema-system';
import { teamMembers, teams } from '@/lib/db/schema';
import { incidents, assets, runbooks } from '@/lib/db/schema-ir';
import { communicationTemplates } from '@/lib/db/schema-ir';
import { eq, count, sql } from 'drizzle-orm';
import { QuotaExceededError, RateLimitExceededError, QuotaCheckResult } from '@/lib/types/api-responses';
import { ResourceType, ResourceUsage, ResourceLimits } from '@/lib/types/limits';

/**
 * Get current usage for an organization
 */
export async function getCurrentUsage(organizationId: number): Promise<ResourceUsage> {
  const [
    userCount,
    incidentCount,
    assetCount,
    runbookCount,
    templateCount
  ] = await Promise.all([
    // Users count
    db.select({ count: count() })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, organizationId)),

    // Incidents count
    db.select({ count: count() })
      .from(incidents)
      .where(eq(incidents.organizationId, organizationId)),

    // Assets count
    db.select({ count: count() })
      .from(assets)
      .where(eq(assets.organizationId, organizationId)),

    // Runbooks count
    db.select({ count: count() })
      .from(runbooks)
      .where(eq(runbooks.organizationId, organizationId)),

    // Communication templates count
    db.select({ count: count() })
      .from(communicationTemplates)
      .where(eq(communicationTemplates.organizationId, organizationId))
  ]);

  // Get current limits for storage and API usage
  const limitsResult = await db
    .select({
      currentStorageMb: organizationLimits.currentStorageMb,
      apiCallsThisHour: organizationLimits.apiCallsThisHour
    })
    .from(organizationLimits)
    .where(eq(organizationLimits.organizationId, organizationId))
    .limit(1);

  const limits = limitsResult[0] || { currentStorageMb: 0, apiCallsThisHour: 0 };

  return {
    users: userCount[0].count,
    incidents: incidentCount[0].count,
    assets: assetCount[0].count,
    runbooks: runbookCount[0].count,
    templates: templateCount[0].count,
    storageMb: limits.currentStorageMb,
    apiCallsThisHour: limits.apiCallsThisHour
  };
}

/**
 * Get organization limits
 */
export async function getOrganizationLimits(organizationId: number): Promise<ResourceLimits | null> {
  const result = await db
    .select({
      maxUsers: organizationLimits.maxUsers,
      maxIncidents: organizationLimits.maxIncidents,
      maxAssets: organizationLimits.maxAssets,
      maxRunbooks: organizationLimits.maxRunbooks,
      maxTemplates: organizationLimits.maxTemplates,
      maxStorageMb: organizationLimits.maxStorageMb,
      apiRateLimit: organizationLimits.apiRateLimit
    })
    .from(organizationLimits)
    .where(eq(organizationLimits.organizationId, organizationId))
    .limit(1);

  return result[0] || null;
}

/**
 * Ensure organization limits record exists
 */
export async function ensureOrganizationLimits(organizationId: number): Promise<void> {
  const existing = await db
    .select({ id: organizationLimits.id })
    .from(organizationLimits)
    .where(eq(organizationLimits.organizationId, organizationId))
    .limit(1);

  if (existing.length === 0) {
    // Create default limits based on license type
    const team = await db
      .select({ licenseType: teams.licenseType })
      .from(teams)
      .where(eq(teams.id, organizationId))
      .limit(1);

    const licenseType = team[0]?.licenseType || 'starter';

    // Set default limits based on license
    let defaultLimits = {
      maxUsers: 5,
      maxIncidents: 100,
      maxAssets: 500,
      maxRunbooks: 50,
      maxTemplates: 100,
      maxStorageMb: 1024, // 1GB
      apiRateLimit: 1000
    };

    if (licenseType === 'professional') {
      defaultLimits = {
        maxUsers: 25,
        maxIncidents: 1000,
        maxAssets: 5000,
        maxRunbooks: 500,
        maxTemplates: 1000,
        maxStorageMb: 10240, // 10GB
        apiRateLimit: 10000
      };
    } else if (licenseType === 'enterprise') {
      defaultLimits = {
        maxUsers: 100,
        maxIncidents: null, // Unlimited
        maxAssets: null, // Unlimited
        maxRunbooks: null, // Unlimited
        maxTemplates: null, // Unlimited
        maxStorageMb: 102400, // 100GB
        apiRateLimit: 100000
      };
    }

    await db.insert(organizationLimits).values({
      organizationId,
      ...defaultLimits
    });
  }
}

/**
 * Check quota for a specific resource type
 */
export async function checkQuota(
  organizationId: number,
  resourceType: ResourceType,
  incrementBy: number = 1
): Promise<QuotaCheckResult> {
  await ensureOrganizationLimits(organizationId);

  const [usage, limits] = await Promise.all([
    getCurrentUsage(organizationId),
    getOrganizationLimits(organizationId)
  ]);

  if (!limits) {
    throw new Error('Failed to retrieve organization limits');
  }

  let current: number;
  let limit: number | null;

  switch (resourceType) {
    case 'users':
      current = usage.users;
      limit = limits.maxUsers;
      break;
    case 'incidents':
      current = usage.incidents;
      limit = limits.maxIncidents;
      break;
    case 'assets':
      current = usage.assets;
      limit = limits.maxAssets;
      break;
    case 'runbooks':
      current = usage.runbooks;
      limit = limits.maxRunbooks;
      break;
    case 'templates':
      current = usage.templates;
      limit = limits.maxTemplates;
      break;
    case 'storage':
      current = usage.storageMb;
      limit = limits.maxStorageMb;
      break;
    default:
      throw new Error(`Invalid resource type: ${resourceType}`);
  }

  // If limit is null, it means unlimited (enterprise)
  if (limit === null) {
    return {
      allowed: true,
      current,
      limit: -1, // Indicate unlimited
      remaining: -1
    };
  }

  const wouldExceed = current + incrementBy > limit;

  if (wouldExceed) {
    const error = new QuotaExceededError(
      resourceType,
      current,
      limit,
      `/pricing?upgrade=${resourceType}`
    );

    return {
      allowed: false,
      current,
      limit,
      remaining: limit - current,
      error
    };
  }

  return {
    allowed: true,
    current,
    limit,
    remaining: limit - current
  };
}

/**
 * Check API rate limit
 */
export async function checkRateLimit(organizationId: number): Promise<QuotaCheckResult> {
  await ensureOrganizationLimits(organizationId);

  const result = await db
    .select({
      apiCallsThisHour: organizationLimits.apiCallsThisHour,
      apiRateLimit: organizationLimits.apiRateLimit,
      apiResetAt: organizationLimits.apiResetAt
    })
    .from(organizationLimits)
    .where(eq(organizationLimits.organizationId, organizationId))
    .limit(1);

  const limits = result[0];
  if (!limits) {
    throw new Error('Failed to retrieve rate limits');
  }

  const now = new Date();
  const resetAt = limits.apiResetAt;

  // Reset counter if hour has passed
  if (!resetAt || now > resetAt) {
    const nextReset = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    await db
      .update(organizationLimits)
      .set({
        apiCallsThisHour: 0,
        apiResetAt: nextReset
      })
      .where(eq(organizationLimits.organizationId, organizationId));

    return {
      allowed: true,
      current: 0,
      limit: limits.apiRateLimit || 1000,
      remaining: limits.apiRateLimit || 1000
    };
  }

  const current = limits.apiCallsThisHour;
  const limit = limits.apiRateLimit || 1000;

  if (current >= limit) {
    const error = new RateLimitExceededError(current, limit, resetAt);
    return {
      allowed: false,
      current,
      limit,
      remaining: 0,
      error: error as any // Type assertion for compatibility
    };
  }

  return {
    allowed: true,
    current,
    limit,
    remaining: limit - current
  };
}

/**
 * Increment API call counter
 */
export async function incrementApiUsage(organizationId: number): Promise<void> {
  await db
    .update(organizationLimits)
    .set({
      apiCallsThisHour: sql`${organizationLimits.apiCallsThisHour} + 1`
    })
    .where(eq(organizationLimits.organizationId, organizationId));
}

/**
 * Update resource counter after successful creation
 */
export async function updateResourceCount(
  organizationId: number,
  resourceType: ResourceType,
  incrementBy: number = 1
): Promise<void> {
  const updateData: Record<string, any> = {};

  switch (resourceType) {
    case 'users':
      updateData.currentUsers = sql`${organizationLimits.currentUsers} + ${incrementBy}`;
      break;
    case 'storage':
      updateData.currentStorageMb = sql`${organizationLimits.currentStorageMb} + ${incrementBy}`;
      break;
    // For other resources, we rely on real-time counting
    // but we could add caching here for performance
  }

  if (Object.keys(updateData).length > 0) {
    await db
      .update(organizationLimits)
      .set(updateData)
      .where(eq(organizationLimits.organizationId, organizationId));
  }
}

/**
 * Validation middleware function for server actions
 */
export async function enforceQuota(
  organizationId: number,
  resourceType: ResourceType,
  incrementBy: number = 1
): Promise<void> {
  const result = await checkQuota(organizationId, resourceType, incrementBy);

  if (!result.allowed && result.error) {
    throw result.error;
  }
}

/**
 * Validation middleware for API rate limiting
 */
export async function enforceRateLimit(organizationId: number): Promise<void> {
  const result = await checkRateLimit(organizationId);

  if (!result.allowed && result.error) {
    throw result.error;
  }

  // Increment counter if within limits
  await incrementApiUsage(organizationId);
}

/**
 * Get quota summary for an organization
 */
export async function getQuotaSummary(organizationId: number) {
  const [usage, limits] = await Promise.all([
    getCurrentUsage(organizationId),
    getOrganizationLimits(organizationId)
  ]);

  if (!limits) {
    throw new Error('Organization limits not found');
  }

  const percentages: Record<ResourceType, number> = {
    users: limits.maxUsers ? Math.round((usage.users / limits.maxUsers) * 100) : 0,
    incidents: limits.maxIncidents ? Math.round((usage.incidents / limits.maxIncidents) * 100) : 0,
    assets: limits.maxAssets ? Math.round((usage.assets / limits.maxAssets) * 100) : 0,
    runbooks: limits.maxRunbooks ? Math.round((usage.runbooks / limits.maxRunbooks) * 100) : 0,
    templates: limits.maxTemplates ? Math.round((usage.templates / limits.maxTemplates) * 100) : 0,
    storage: Math.round((usage.storageMb / limits.maxStorageMb) * 100)
  };

  return {
    usage,
    limits,
    percentages,
    warnings: Object.entries(percentages)
      .filter(([_, percentage]) => percentage > 80)
      .map(([resource, percentage]) => ({
        resource: resource as ResourceType,
        percentage,
        message: `${resource} usage is at ${percentage}%`
      }))
  };
}