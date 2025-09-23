'use server';

import { z } from 'zod';
import { validatedActionWithUserAndTeam } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';
import { communicationTemplates } from '@/lib/db/schema-ir';
import { activityLogs, ActivityType } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

// Schema for creating communication templates
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255),
  description: z.string().optional().nullable(),
  type: z.enum(['email', 'sms', 'slack', 'teams', 'webhook']),
  category: z.enum(['incident', 'maintenance', 'security', 'general']).default('general'),
  subject: z.string().min(1, 'Subject is required').max(500),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

const updateTemplateSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Template name is required').max(255).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['email', 'sms', 'slack', 'teams', 'webhook']).optional(),
  category: z.enum(['incident', 'maintenance', 'security', 'general']).optional(),
  subject: z.string().min(1, 'Subject is required').max(500).optional(),
  content: z.string().min(1, 'Content is required').optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

/**
 * Create a new communication template with quota enforcement
 */
export const createCommunicationTemplate = validatedActionWithUserAndTeam(
  createTemplateSchema,
  async (data, formData, user, team) => {
    try {
      // Create the template
      const [template] = await db
        .insert(communicationTemplates)
        .values({
          organizationId: team.id,
          name: data.name,
          description: data.description,
          type: data.type,
          category: data.category,
          subject: data.subject,
          content: data.content,
          variables: data.variables,
          isActive: data.isActive,
          createdBy: user.id,
        })
        .returning();

      // Log the activity
      await db.insert(activityLogs).values({
        teamId: team.id,
        userId: user.id,
        action: ActivityType.CREATE_INCIDENT, // We'll need to add CREATE_TEMPLATE
        ipAddress: '', // Not available in server actions
      });

      revalidatePath('/communications');

      return {
        success: true,
        template,
        message: 'Communication template created successfully'
      };

    } catch (error) {
      console.error('Error creating communication template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template'
      };
    }
  },
  {
    quota: {
      resourceType: 'templates',
      incrementBy: 1
    },
    feature: {
      feature: 'communications',
      upgradeUrl: '/pricing?feature=communications'
    }
  }
);

/**
 * Update an existing communication template
 */
export const updateCommunicationTemplate = validatedActionWithUserAndTeam(
  updateTemplateSchema,
  async (data, formData, user, team) => {
    try {
      const { id, ...updateData } = data;

      // Check if template exists and belongs to organization
      const existingTemplate = await db
        .select()
        .from(communicationTemplates)
        .where(
          eq(communicationTemplates.id, id) &&
          eq(communicationTemplates.organizationId, team.id)
        )
        .limit(1);

      if (!existingTemplate.length) {
        return {
          success: false,
          error: 'Template not found or access denied'
        };
      }

      // Update the template
      const [updatedTemplate] = await db
        .update(communicationTemplates)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(communicationTemplates.id, id))
        .returning();

      // Log the activity
      await db.insert(activityLogs).values({
        teamId: team.id,
        userId: user.id,
        action: ActivityType.UPDATE_INCIDENT, // We'll need to add UPDATE_TEMPLATE
        ipAddress: '',
      });

      revalidatePath('/communications');
      revalidatePath(`/communications/${id}`);

      return {
        success: true,
        template: updatedTemplate,
        message: 'Communication template updated successfully'
      };

    } catch (error) {
      console.error('Error updating communication template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template'
      };
    }
  },
  {
    feature: {
      feature: 'communications',
      upgradeUrl: '/pricing?feature=communications'
    }
  }
);

/**
 * Delete a communication template
 */
export async function deleteCommunicationTemplate(templateId: number) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const team = await getTeamForUser();
  if (!team) {
    return { success: false, error: 'Organization not found' };
  }

  try {
    // Check if template exists and belongs to organization
    const existingTemplate = await db
      .select()
      .from(communicationTemplates)
      .where(
        eq(communicationTemplates.id, templateId) &&
        eq(communicationTemplates.organizationId, team.id)
      )
      .limit(1);

    if (!existingTemplate.length) {
      return {
        success: false,
        error: 'Template not found or access denied'
      };
    }

    // Delete the template
    await db
      .delete(communicationTemplates)
      .where(eq(communicationTemplates.id, templateId));

    // Log the activity
    await db.insert(activityLogs).values({
      teamId: team.id,
      userId: user.id,
      action: ActivityType.DELETE_ASSET, // We'll need to add DELETE_TEMPLATE
      ipAddress: '',
    });

    revalidatePath('/communications');

    return {
      success: true,
      message: 'Communication template deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting communication template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete template'
    };
  }
}

// Import needed dependencies
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';