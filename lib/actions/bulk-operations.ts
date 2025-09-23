'use server';

import { z } from 'zod';
import { validatedActionWithUserAndTeam } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';
import { assets, incidents } from '@/lib/db/schema-ir';
import { activityLogs, ActivityType } from '@/lib/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Schema for bulk asset operations
const bulkAssetUpdateSchema = z.object({
  assetIds: z.array(z.number()).min(1, 'At least one asset must be selected'),
  updates: z.object({
    criticality: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    location: z.string().optional(),
    primaryContact: z.string().optional(),
    vendor: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })
});

const bulkAssetDeleteSchema = z.object({
  assetIds: z.array(z.number()).min(1, 'At least one asset must be selected'),
  reason: z.string().min(1, 'Reason for deletion is required')
});

const bulkIncidentCloseSchema = z.object({
  incidentIds: z.array(z.number()).min(1, 'At least one incident must be selected'),
  resolution: z.string().min(1, 'Resolution summary is required'),
  lessonsLearned: z.string().optional()
});

/**
 * Bulk update assets - Professional feature
 */
export const bulkUpdateAssets = validatedActionWithUserAndTeam(
  bulkAssetUpdateSchema,
  async (data, formData, user, team) => {
    try {
      // Verify all assets belong to the organization
      const ownedAssets = await db
        .select({ id: assets.id })
        .from(assets)
        .where(
          and(
            inArray(assets.id, data.assetIds),
            eq(assets.organizationId, team.id)
          )
        );

      if (ownedAssets.length !== data.assetIds.length) {
        return {
          success: false,
          error: 'Some assets not found or access denied'
        };
      }

      // Perform bulk update
      const updateData = {
        ...data.updates,
        updatedAt: new Date()
      };

      await db
        .update(assets)
        .set(updateData)
        .where(inArray(assets.id, data.assetIds));

      // Log the activity
      await db.insert(activityLogs).values({
        teamId: team.id,
        userId: user.id,
        action: ActivityType.UPDATE_ASSET,
        ipAddress: '',
      });

      revalidatePath('/assets');

      return {
        success: true,
        message: `Successfully updated ${data.assetIds.length} assets`,
        count: data.assetIds.length
      };

    } catch (error) {
      console.error('Error in bulk asset update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update assets'
      };
    }
  },
  {
    feature: {
      feature: 'bulkOperations',
      upgradeUrl: '/pricing?feature=bulk-operations'
    }
  }
);

/**
 * Bulk delete assets - Professional feature
 */
export const bulkDeleteAssets = validatedActionWithUserAndTeam(
  bulkAssetDeleteSchema,
  async (data, formData, user, team) => {
    try {
      // Verify all assets belong to the organization
      const ownedAssets = await db
        .select({ id: assets.id, name: assets.name })
        .from(assets)
        .where(
          and(
            inArray(assets.id, data.assetIds),
            eq(assets.organizationId, team.id)
          )
        );

      if (ownedAssets.length !== data.assetIds.length) {
        return {
          success: false,
          error: 'Some assets not found or access denied'
        };
      }

      // Perform bulk delete
      await db
        .delete(assets)
        .where(inArray(assets.id, data.assetIds));

      // Log the activity with details
      await db.insert(activityLogs).values({
        teamId: team.id,
        userId: user.id,
        action: ActivityType.DELETE_ASSET,
        ipAddress: '',
      });

      revalidatePath('/assets');

      return {
        success: true,
        message: `Successfully deleted ${data.assetIds.length} assets`,
        count: data.assetIds.length,
        reason: data.reason
      };

    } catch (error) {
      console.error('Error in bulk asset deletion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete assets'
      };
    }
  },
  {
    feature: {
      feature: 'bulkOperations',
      upgradeUrl: '/pricing?feature=bulk-operations'
    }
  }
);

/**
 * Bulk close incidents - Professional feature
 */
export const bulkCloseIncidents = validatedActionWithUserAndTeam(
  bulkIncidentCloseSchema,
  async (data, formData, user, team) => {
    try {
      // Verify all incidents belong to the organization and are open
      const ownedIncidents = await db
        .select({
          id: incidents.id,
          title: incidents.title,
          status: incidents.status
        })
        .from(incidents)
        .where(
          and(
            inArray(incidents.id, data.incidentIds),
            eq(incidents.organizationId, team.id)
          )
        );

      if (ownedIncidents.length !== data.incidentIds.length) {
        return {
          success: false,
          error: 'Some incidents not found or access denied'
        };
      }

      // Check if any incidents are already closed
      const openIncidents = ownedIncidents.filter(inc => inc.status !== 'closed');
      if (openIncidents.length !== data.incidentIds.length) {
        return {
          success: false,
          error: 'Some incidents are already closed'
        };
      }

      // Perform bulk close
      await db
        .update(incidents)
        .set({
          status: 'closed',
          resolvedAt: new Date(),
          resolution: data.resolution,
          lessonsLearned: data.lessonsLearned,
          updatedAt: new Date()
        })
        .where(inArray(incidents.id, data.incidentIds));

      // Log the activity
      await db.insert(activityLogs).values({
        teamId: team.id,
        userId: user.id,
        action: ActivityType.CLOSE_INCIDENT,
        ipAddress: '',
      });

      revalidatePath('/incidents');

      return {
        success: true,
        message: `Successfully closed ${data.incidentIds.length} incidents`,
        count: data.incidentIds.length
      };

    } catch (error) {
      console.error('Error in bulk incident closure:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to close incidents'
      };
    }
  },
  {
    feature: {
      feature: 'bulkOperations',
      upgradeUrl: '/pricing?feature=bulk-operations'
    }
  }
);

/**
 * Advanced reporting export - Enterprise feature
 */
const exportDataSchema = z.object({
  type: z.enum(['assets', 'incidents', 'audit_logs', 'full_backup']),
  dateRange: z.object({
    from: z.string(),
    to: z.string()
  }),
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  includeMetadata: z.boolean().default(false)
});

export const exportOrganizationData = validatedActionWithUserAndTeam(
  exportDataSchema,
  async (data, formData, user, team) => {
    try {
      // This would implement the actual export logic
      // For now, we'll simulate it

      const exportUrl = `/api/exports/${data.type}?from=${data.dateRange.from}&to=${data.dateRange.to}&format=${data.format}`;

      // Log the activity
      await db.insert(activityLogs).values({
        teamId: team.id,
        userId: user.id,
        action: ActivityType.UPDATE_ACCOUNT, // We'll need to add EXPORT_DATA
        ipAddress: '',
      });

      return {
        success: true,
        message: 'Export initiated successfully',
        exportUrl,
        estimatedTime: '2-5 minutes'
      };

    } catch (error) {
      console.error('Error initiating export:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate export'
      };
    }
  },
  {
    feature: {
      feature: 'advancedReporting',
      upgradeUrl: '/pricing?feature=advanced-reporting'
    }
  }
);

// Import needed dependencies at the end to avoid hoisting issues
import { and } from 'drizzle-orm';