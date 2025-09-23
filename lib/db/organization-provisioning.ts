import { db } from './drizzle';
import { teams } from './schema';
import { tags } from './schema-tags';
import { provisionDefaultTagsForOrganization } from './queries-content';
import { CacheInvalidation } from '@/lib/cache';
import { eq } from 'drizzle-orm';

/**
 * Provision a new organization with default settings and tags
 */
export async function provisionNewOrganization(organizationData: {
  name: string;
  adminUserId: number;
  industry?: string;
  size?: string;
  address?: string;
  phone?: string;
  website?: string;
}) {
  return await db.transaction(async (tx) => {
    // Create the organization
    const [organization] = await tx
      .insert(teams)
      .values({
        name: organizationData.name,
        industry: organizationData.industry,
        size: organizationData.size,
        address: organizationData.address,
        phone: organizationData.phone,
        website: organizationData.website,
        status: 'trial',
        licenseCount: 5,
        licenseType: 'standard',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        features: JSON.stringify({
          incident_response: true,
          asset_management: true,
          runbooks: true,
          communications: true,
          training: false, // Premium feature
          advanced_analytics: false, // Premium feature
          api_access: false, // Premium feature
        }),
      })
      .returning();

    // Provision default tags for the organization
    const defaultTags = await provisionDefaultTagsForOrganization(
      organization.id,
      organizationData.adminUserId
    );

    // Invalidate relevant caches
    CacheInvalidation.invalidateEffectiveTags(organization.id);
    CacheInvalidation.invalidateAllForOrganization(organization.id);

    return {
      organization,
      defaultTags,
    };
  });
}

/**
 * Update organization features based on license type
 */
export async function updateOrganizationFeatures(
  organizationId: number,
  licenseType: 'standard' | 'professional' | 'enterprise'
) {
  const featureMap = {
    standard: {
      incident_response: true,
      asset_management: true,
      runbooks: true,
      communications: true,
      training: false,
      advanced_analytics: false,
      api_access: false,
      custom_branding: false,
      sso: false,
      audit_logs: false,
    },
    professional: {
      incident_response: true,
      asset_management: true,
      runbooks: true,
      communications: true,
      training: true,
      advanced_analytics: true,
      api_access: true,
      custom_branding: false,
      sso: false,
      audit_logs: true,
    },
    enterprise: {
      incident_response: true,
      asset_management: true,
      runbooks: true,
      communications: true,
      training: true,
      advanced_analytics: true,
      api_access: true,
      custom_branding: true,
      sso: true,
      audit_logs: true,
    },
  };

  const features = featureMap[licenseType];

  const [updatedOrg] = await db
    .update(teams)
    .set({
      licenseType,
      features: JSON.stringify(features),
      updatedAt: new Date(),
    })
    .where(eq(teams.id, organizationId))
    .returning();

  // Invalidate caches
  CacheInvalidation.invalidateAllForOrganization(organizationId);

  return updatedOrg;
}

/**
 * Deactivate organization and cleanup resources
 */
export async function deactivateOrganization(organizationId: number) {
  return await db.transaction(async (tx) => {
    // Update organization status
    await tx
      .update(teams)
      .set({
        status: 'suspended',
        updatedAt: new Date(),
      })
      .where(eq(teams.id, organizationId));

    // Optionally soft-delete or anonymize data
    // This would depend on your data retention policies

    // Invalidate all caches for this organization
    CacheInvalidation.invalidateAllForOrganization(organizationId);

    return true;
  });
}

/**
 * Reactivate organization
 */
export async function reactivateOrganization(organizationId: number) {
  const [updatedOrg] = await db
    .update(teams)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(teams.id, organizationId))
    .returning();

  // Invalidate caches
  CacheInvalidation.invalidateAllForOrganization(organizationId);

  return updatedOrg;
}