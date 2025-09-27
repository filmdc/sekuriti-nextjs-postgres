'use server';

import { db } from '@/lib/db/drizzle';
import {
  assets,
  incidents,
  runbooks,
  communicationTemplates,
  tabletopExercises,
  runbookSteps
} from '@/lib/db/schema-ir';
import { users, teamMembers, teams, activityLogs } from '@/lib/db/schema';
import { tags, taggables } from '@/lib/db/schema-tags';
import { getTeamForUser } from '@/lib/db/queries';
import { eq, desc, and, sql } from 'drizzle-orm';

// Enhanced Asset export with related data
export async function exportAssetsEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const assetsData = await db
    .select({
      id: assets.id,
      name: assets.name,
      type: assets.type,
      identifier: assets.identifier,
      description: assets.description,
      criticality: assets.criticality,
      status: assets.status,
      vendor: assets.vendor,
      location: assets.location,
      expirationDate: assets.expirationDate,
      mustContactVendor: assets.mustContactVendor,
      createdAt: assets.createdAt,
      updatedAt: assets.updatedAt,
      tags: sql<string>`
        STRING_AGG(
          CASE WHEN t.id IS NOT NULL
          THEN t.name
          ELSE NULL END,
          ','
        )`.as('tags')
    })
    .from(assets)
    .leftJoin(taggables, and(
      eq(taggables.taggableType, 'asset'),
      eq(taggables.taggableId, assets.id)
    ))
    .leftJoin(tags as any, eq(taggables.tagId, (tags as any).id))
    .where(eq(assets.organizationId, team.id))
    .groupBy(assets.id)
    .orderBy(desc(assets.createdAt));

  return assetsData;
}

// Enhanced Incident export
export async function exportIncidentsEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const incidentsData = await db
    .select({
      id: incidents.id,
      title: incidents.title,
      description: incidents.description,
      severity: incidents.severity,
      status: incidents.status,
      detectedAt: incidents.detectedAt,
      containedAt: incidents.containedAt,
      resolvedAt: incidents.resolvedAt,
      closedAt: incidents.closedAt,
      reportedBy: users.name,
      assignedTo: sql<string>`
        (SELECT u2.name FROM users u2 WHERE u2.id = incidents.assigned_to)
      `.as('assignedTo'),
      affectedAssets: sql<number>`
        (SELECT COUNT(*) FROM incident_assets WHERE incident_id = incidents.id)
      `.as('affectedAssets'),
      createdAt: incidents.createdAt,
      updatedAt: incidents.updatedAt
    })
    .from(incidents)
    .leftJoin(users, eq(incidents.reportedBy, users.id))
    .where(eq(incidents.organizationId, team.id))
    .orderBy(desc(incidents.detectedAt));

  return incidentsData;
}

// Enhanced Runbook export
export async function exportRunbooksEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const runbooksData = await db
    .select({
      id: runbooks.id,
      title: runbooks.title,
      description: runbooks.description,
      category: runbooks.category,
      severity: runbooks.severity,
      status: runbooks.status,
      estimatedDuration: runbooks.estimatedDuration,
      executionCount: runbooks.executionCount,
      lastExecutedAt: runbooks.lastExecutedAt,
      stepCount: sql<number>`
        (SELECT COUNT(*) FROM runbook_steps WHERE runbook_id = runbooks.id)
      `.as('stepCount'),
      createdBy: users.name,
      createdAt: runbooks.createdAt,
      updatedAt: runbooks.updatedAt
    })
    .from(runbooks)
    .leftJoin(users, eq(runbooks.createdBy, users.id))
    .where(eq(runbooks.organizationId, team.id))
    .orderBy(desc(runbooks.createdAt));

  return runbooksData;
}

// Enhanced Communication Templates export
export async function exportCommunicationTemplatesEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const templatesData = await db
    .select({
      id: communicationTemplates.id,
      name: communicationTemplates.name,
      type: communicationTemplates.type,
      category: communicationTemplates.category,
      subject: communicationTemplates.subject,
      body: communicationTemplates.body,
      variables: communicationTemplates.variables,
      usageCount: communicationTemplates.usageCount,
      lastUsedAt: communicationTemplates.lastUsedAt,
      createdBy: users.name,
      createdAt: communicationTemplates.createdAt,
      updatedAt: communicationTemplates.updatedAt
    })
    .from(communicationTemplates)
    .leftJoin(users, eq(communicationTemplates.createdBy, users.id))
    .where(eq(communicationTemplates.organizationId, team.id))
    .orderBy(desc(communicationTemplates.createdAt));

  return templatesData;
}

// Enhanced Exercise export
export async function exportExercisesEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const exercisesData = await db
    .select({
      id: tabletopExercises.id,
      title: tabletopExercises.title,
      description: tabletopExercises.description,
      type: tabletopExercises.type,
      status: tabletopExercises.status,
      difficulty: tabletopExercises.difficulty,
      duration: tabletopExercises.duration,
      maxParticipants: tabletopExercises.maxParticipants,
      completionCount: tabletopExercises.completionCount,
      averageScore: tabletopExercises.averageScore,
      lastCompletedAt: tabletopExercises.lastCompletedAt,
      createdBy: users.name,
      createdAt: tabletopExercises.createdAt,
      updatedAt: tabletopExercises.updatedAt
    })
    .from(tabletopExercises)
    .leftJoin(users, eq(tabletopExercises.createdBy, users.id))
    .where(eq(tabletopExercises.organizationId, team.id))
    .orderBy(desc(tabletopExercises.createdAt));

  return exercisesData;
}

// Enhanced Tags export
export async function exportTagsEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const tagsData = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
      description: tags.description,
      category: tags.category,
      isActive: tags.isActive,
      usageCount: sql<number>`
        (SELECT COUNT(*) FROM taggables WHERE tag_id = tags.id)
      `.as('usageCount'),
      createdBy: users.name,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt
    })
    .from(tags)
    .leftJoin(users, eq(tags.createdBy, users.id))
    .where(eq(tags.organizationId, team.id))
    .orderBy(desc(tags.createdAt));

  return tagsData;
}

// Enhanced Team Members export
export async function exportTeamMembersEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const membersData = await db
    .select({
      id: teamMembers.id,
      name: users.name,
      email: users.email,
      role: teamMembers.role,
      title: users.title,
      department: users.department,
      phone: users.phone,
      isOrganizationAdmin: users.isOrganizationAdmin,
      lastLoginAt: users.lastLoginAt,
      joinedAt: teamMembers.joinedAt,
      createdAt: users.createdAt
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, team.id))
    .orderBy(desc(teamMembers.joinedAt));

  return membersData;
}

// Enhanced Activity Logs export
export async function exportActivityLogsEnhanced(format: 'csv' | 'json' | 'excel' = 'json', limit: number = 1000) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const logsData = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      userName: users.name,
      userEmail: users.email,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.teamId, team.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(limit);

  return logsData;
}

// Organizations export (Admin only)
export async function exportOrganizationsEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  // This should only be accessible by system admins
  const organizationsData = await db
    .select({
      id: teams.id,
      name: teams.name,
      status: teams.status,
      industry: teams.industry,
      size: teams.size,
      phone: teams.phone,
      website: teams.website,
      customDomain: teams.customDomain,
      planName: teams.planName,
      subscriptionStatus: teams.subscriptionStatus,
      trialEndsAt: teams.trialEndsAt,
      memberCount: sql<number>`
        (SELECT COUNT(*) FROM team_members WHERE team_id = teams.id)
      `.as('memberCount'),
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt
    })
    .from(teams)
    .orderBy(desc(teams.createdAt));

  return organizationsData;
}

// Users export (Admin only)
export async function exportUsersEnhanced(format: 'csv' | 'json' | 'excel' = 'json') {
  // This should only be accessible by system admins
  const usersData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      title: users.title,
      department: users.department,
      phone: users.phone,
      isOrganizationAdmin: users.isOrganizationAdmin,
      isSystemAdmin: users.isSystemAdmin,
      lastLoginAt: users.lastLoginAt,
      organizationCount: sql<number>`
        (SELECT COUNT(*) FROM team_members WHERE user_id = users.id)
      `.as('organizationCount'),
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return usersData;
}