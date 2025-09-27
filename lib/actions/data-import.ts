'use server';

import { db } from '@/lib/db/drizzle';
import {
  assets,
  incidents,
  runbooks,
  communicationTemplates,
  tabletopExercises
} from '@/lib/db/schema-ir';
import { users, teamMembers, teams } from '@/lib/db/schema';
import { tags, taggables } from '@/lib/db/schema-tags';
import { getTeamForUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

// Asset import
export async function importAssetsAction(data: any[], format: string) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const importedAssets = [];
  const errors = [];

  for (const row of data) {
    try {
      const [asset] = await db
        .insert(assets)
        .values({
          organizationId: team.id,
          name: row.name || row.Name || 'Unnamed Asset',
          type: (row.type || row.Type || 'hardware').toLowerCase(),
          identifier: row.identifier || row.Identifier || row.id || null,
          description: row.description || row.Description || null,
          criticality: (row.criticality || row.Criticality || 'medium').toLowerCase(),
          status: (row.status || row.Status || 'active').toLowerCase(),
          vendor: row.vendor || row.Vendor || null,
          location: row.location || row.Location || null,
          expirationDate: row.expirationDate ? new Date(row.expirationDate) : null,
          mustContactVendor: row.mustContactVendor === true || row.mustContactVendor === 'true',
          createdBy: team.teamMembers[0].userId,
          metadata: {}
        })
        .returning();

      importedAssets.push(asset);
    } catch (error) {
      errors.push({ row, error: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  return {
    success: importedAssets.length,
    failed: errors.length,
    errors: errors.slice(0, 10) // Return max 10 errors
  };
}

// Incident import
export async function importIncidentsAction(data: any[], format: string) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const importedIncidents = [];
  const errors = [];

  for (const row of data) {
    try {
      const [incident] = await db
        .insert(incidents)
        .values({
          organizationId: team.id,
          title: row.title || row.Title || 'Untitled Incident',
          description: row.description || row.Description || null,
          severity: (row.severity || row.Severity || 'medium').toLowerCase(),
          status: (row.status || row.Status || 'detection').toLowerCase(),
          detectedAt: row.detectedAt ? new Date(row.detectedAt) : new Date(),
          reportedBy: team.teamMembers[0].userId,
          metadata: {}
        })
        .returning();

      importedIncidents.push(incident);
    } catch (error) {
      errors.push({ row, error: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  return {
    success: importedIncidents.length,
    failed: errors.length,
    errors: errors.slice(0, 10)
  };
}

// Runbook import
export async function importRunbooksAction(data: any[], format: string) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const importedRunbooks = [];
  const errors = [];

  for (const row of data) {
    try {
      const [runbook] = await db
        .insert(runbooks)
        .values({
          organizationId: team.id,
          title: row.title || row.Title || 'Untitled Runbook',
          description: row.description || row.Description || null,
          category: row.category || row.Category || 'general',
          severity: (row.severity || row.Severity || 'medium').toLowerCase(),
          status: (row.status || row.Status || 'draft').toLowerCase(),
          estimatedDuration: parseInt(row.estimatedDuration || row.EstimatedDuration || '60'),
          createdBy: team.teamMembers[0].userId,
          metadata: {}
        })
        .returning();

      importedRunbooks.push(runbook);
    } catch (error) {
      errors.push({ row, error: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  return {
    success: importedRunbooks.length,
    failed: errors.length,
    errors: errors.slice(0, 10)
  };
}

// Communication Template import
export async function importCommunicationTemplatesAction(data: any[], format: string) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const importedTemplates = [];
  const errors = [];

  for (const row of data) {
    try {
      const [template] = await db
        .insert(communicationTemplates)
        .values({
          organizationId: team.id,
          name: row.name || row.Name || 'Untitled Template',
          type: (row.type || row.Type || 'email').toLowerCase(),
          category: row.category || row.Category || 'general',
          subject: row.subject || row.Subject || '',
          body: row.body || row.Body || '',
          variables: row.variables ? JSON.parse(row.variables) : [],
          metadata: {},
          createdBy: team.teamMembers[0].userId
        })
        .returning();

      importedTemplates.push(template);
    } catch (error) {
      errors.push({ row, error: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  return {
    success: importedTemplates.length,
    failed: errors.length,
    errors: errors.slice(0, 10)
  };
}

// Exercise import
export async function importExercisesAction(data: any[], format: string) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const importedExercises = [];
  const errors = [];

  for (const row of data) {
    try {
      const [exercise] = await db
        .insert(tabletopExercises)
        .values({
          organizationId: team.id,
          title: row.title || row.Title || 'Untitled Exercise',
          description: row.description || row.Description || null,
          type: (row.type || row.Type || 'tabletop').toLowerCase(),
          status: (row.status || row.Status || 'draft').toLowerCase(),
          difficulty: (row.difficulty || row.Difficulty || 'medium').toLowerCase(),
          duration: parseInt(row.duration || row.Duration || '60'),
          maxParticipants: parseInt(row.maxParticipants || row.MaxParticipants || '10'),
          createdBy: team.teamMembers[0].userId,
          metadata: {}
        })
        .returning();

      importedExercises.push(exercise);
    } catch (error) {
      errors.push({ row, error: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  return {
    success: importedExercises.length,
    failed: errors.length,
    errors: errors.slice(0, 10)
  };
}

// Tag import
export async function importTagsAction(data: any[], format: string) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const importedTags = [];
  const errors = [];

  for (const row of data) {
    try {
      const [tag] = await db
        .insert(tags)
        .values({
          organizationId: team.id,
          name: row.name || row.Name || 'Untitled Tag',
          color: row.color || row.Color || '#808080',
          description: row.description || row.Description || null,
          category: row.category || row.Category || 'general',
          isActive: row.isActive !== false,
          createdBy: team.teamMembers[0].userId
        })
        .returning();

      importedTags.push(tag);
    } catch (error) {
      errors.push({ row, error: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  return {
    success: importedTags.length,
    failed: errors.length,
    errors: errors.slice(0, 10)
  };
}

// Team Member import (for organization owners/admins)
export async function importTeamMembersAction(data: any[], format: string) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const importedMembers = [];
  const errors = [];

  for (const row of data) {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, row.email || row.Email))
        .limit(1);

      let userId;
      if (existingUser.length === 0) {
        // Create new user (they'll need to set password on first login)
        const [newUser] = await db
          .insert(users)
          .values({
            email: row.email || row.Email,
            name: row.name || row.Name || '',
            passwordHash: 'NEEDS_RESET', // User will need to reset password
            role: (row.role || row.Role || 'member').toLowerCase(),
            title: row.title || row.Title || null,
            department: row.department || row.Department || null,
            phone: row.phone || row.Phone || null
          })
          .returning();
        userId = newUser.id;
      } else {
        userId = existingUser[0].id;
      }

      // Check if already a team member
      const existingMember = await db
        .select()
        .from(teamMembers)
        .where(and(
          eq(teamMembers.userId, userId),
          eq(teamMembers.teamId, team.id)
        ))
        .limit(1);

      if (existingMember.length === 0) {
        const [member] = await db
          .insert(teamMembers)
          .values({
            userId,
            teamId: team.id,
            role: (row.role || row.Role || 'member').toLowerCase()
          })
          .returning();

        importedMembers.push(member);
      }
    } catch (error) {
      errors.push({ row, error: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  return {
    success: importedMembers.length,
    failed: errors.length,
    errors: errors.slice(0, 10)
  };
}