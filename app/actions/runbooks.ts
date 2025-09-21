'use server';

import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db';
import { runbooks, runbookSteps } from '@/lib/db/schema-ir';
import { tags, taggables } from '@/lib/db/schema-tags';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getRunbooks(filters?: {
  search?: string;
  classification?: string;
  isTemplate?: boolean;
}) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const team = await getTeamForUser();
  if (!team) {
    throw new Error('Team not found');
  }

  let query = db
    .select()
    .from(runbooks)
    .$dynamic();

  // Add filters
  const conditions = [];

  // Organization filter - templates have null organizationId
  if (filters?.isTemplate) {
    conditions.push(eq(runbooks.isTemplate, true));
  } else {
    conditions.push(
      or(
        eq(runbooks.organizationId, team.id),
        and(
          eq(runbooks.isTemplate, true),
          eq(runbooks.organizationId, null)
        )
      )
    );
  }

  // Search filter
  if (filters?.search) {
    conditions.push(
      or(
        like(runbooks.title, `%${filters.search}%`),
        like(runbooks.description, `%${filters.search}%`)
      )
    );
  }

  // Classification filter
  if (filters?.classification && filters.classification !== 'all') {
    conditions.push(eq(runbooks.classification, filters.classification));
  }

  // Apply conditions
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Order by created date
  query = query.orderBy(desc(runbooks.createdAt));

  const results = await query;

  // Fetch steps count for each runbook
  const runbooksWithSteps = await Promise.all(
    results.map(async (runbook) => {
      const steps = await db
        .select()
        .from(runbookSteps)
        .where(eq(runbookSteps.runbookId, runbook.id));

      // Fetch tags
      const runbookTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          color: tags.color,
        })
        .from(tags)
        .innerJoin(taggables, eq(taggables.tagId, tags.id))
        .where(
          and(
            eq(taggables.taggableType, 'runbook'),
            eq(taggables.taggableId, runbook.id)
          )
        );

      return {
        ...runbook,
        steps,
        tags: runbookTags,
      };
    })
  );

  return runbooksWithSteps;
}

export async function getRunbook(id: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const team = await getTeamForUser();
  if (!team) {
    throw new Error('Team not found');
  }

  const runbook = await db
    .select()
    .from(runbooks)
    .where(eq(runbooks.id, parseInt(id)))
    .limit(1);

  if (!runbook[0]) {
    return null;
  }

  // Check permissions
  if (
    runbook[0].organizationId &&
    runbook[0].organizationId !== team.id &&
    !runbook[0].isTemplate
  ) {
    throw new Error('Unauthorized');
  }

  // Fetch steps
  const steps = await db
    .select()
    .from(runbookSteps)
    .where(eq(runbookSteps.runbookId, parseInt(id)))
    .orderBy(asc(runbookSteps.phase), asc(runbookSteps.stepNumber));

  // Fetch tags
  const runbookTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(tags)
    .innerJoin(taggables, eq(taggables.tagId, tags.id))
    .where(
      and(
        eq(taggables.taggableType, 'runbook'),
        eq(taggables.taggableId, parseInt(id))
      )
    );

  return {
    ...runbook[0],
    steps,
    tags: runbookTags,
  };
}

export async function createRunbook(data: {
  title: string;
  description?: string;
  classification?: string;
  version?: string;
  isTemplate?: boolean;
  steps: Array<{
    phase: string;
    stepNumber: number;
    title: string;
    description: string;
    responsibleRole?: string;
    estimatedDuration?: number;
    isCritical?: boolean;
    tools?: string;
    notes?: string;
  }>;
}) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const team = await getTeamForUser();
  if (!team) {
    throw new Error('Team not found');
  }

  // Create runbook
  const newRunbook = await db
    .insert(runbooks)
    .values({
      organizationId: data.isTemplate ? null : team.id,
      title: data.title,
      description: data.description,
      classification: data.classification as any,
      version: data.version || '1.0',
      isTemplate: data.isTemplate || false,
      isActive: true,
      createdBy: user.id,
    })
    .returning();

  const runbookId = newRunbook[0].id;

  // Create steps
  if (data.steps.length > 0) {
    await db
      .insert(runbookSteps)
      .values(
        data.steps.map(step => ({
          runbookId,
          phase: step.phase,
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          responsibleRole: step.responsibleRole,
          estimatedDuration: step.estimatedDuration || 30,
          isCritical: step.isCritical || false,
          tools: step.tools,
          notes: step.notes,
        }))
      );
  }

  revalidatePath('/runbooks');
  return runbookId;
}

export async function updateRunbook(
  id: string,
  data: {
    title: string;
    description?: string;
    classification?: string;
    version?: string;
    isTemplate?: boolean;
    steps: Array<{
      phase: string;
      stepNumber: number;
      title: string;
      description: string;
      responsibleRole?: string;
      estimatedDuration?: number;
      isCritical?: boolean;
      tools?: string;
      notes?: string;
    }>;
  }
) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const team = await getTeamForUser();
  if (!team) {
    throw new Error('Team not found');
  }

  // Check permissions
  const existingRunbook = await db
    .select()
    .from(runbooks)
    .where(eq(runbooks.id, parseInt(id)))
    .limit(1);

  if (!existingRunbook[0]) {
    throw new Error('Runbook not found');
  }

  if (
    existingRunbook[0].organizationId &&
    existingRunbook[0].organizationId !== team.id
  ) {
    throw new Error('Unauthorized');
  }

  // Update runbook
  await db
    .update(runbooks)
    .set({
      title: data.title,
      description: data.description,
      classification: data.classification as any,
      version: data.version,
      isTemplate: data.isTemplate,
      updatedAt: new Date(),
    })
    .where(eq(runbooks.id, parseInt(id)));

  // Delete existing steps
  await db
    .delete(runbookSteps)
    .where(eq(runbookSteps.runbookId, parseInt(id)));

  // Create new steps
  if (data.steps.length > 0) {
    await db
      .insert(runbookSteps)
      .values(
        data.steps.map(step => ({
          runbookId: parseInt(id),
          phase: step.phase,
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          responsibleRole: step.responsibleRole,
          estimatedDuration: step.estimatedDuration || 30,
          isCritical: step.isCritical || false,
          tools: step.tools,
          notes: step.notes,
        }))
      );
  }

  revalidatePath('/runbooks');
  revalidatePath(`/runbooks/${id}`);
}

export async function cloneTemplate(templateId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const template = await getRunbook(templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  return {
    title: template.title,
    description: template.description,
    classification: template.classification,
    steps: template.steps.map((step: any) => ({
      phase: step.phase,
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      responsibleRole: step.responsibleRole,
      estimatedDuration: step.estimatedDuration,
      isCritical: step.isCritical,
      tools: step.tools,
      notes: step.notes,
    })),
  };
}

export async function createVersion(runbookId: string, newVersion: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const existingRunbook = await getRunbook(runbookId);
  if (!existingRunbook) {
    throw new Error('Runbook not found');
  }

  // Create new runbook with new version
  const newRunbookId = await createRunbook({
    title: existingRunbook.title,
    description: existingRunbook.description,
    classification: existingRunbook.classification,
    version: newVersion,
    isTemplate: existingRunbook.isTemplate,
    steps: existingRunbook.steps.map((step: any) => ({
      phase: step.phase,
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      responsibleRole: step.responsibleRole,
      estimatedDuration: step.estimatedDuration,
      isCritical: step.isCritical,
      tools: step.tools,
      notes: step.notes,
    })),
  });

  return newRunbookId;
}

export async function deleteRunbook(id: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const team = await getTeamForUser();
  if (!team) {
    throw new Error('Team not found');
  }

  // Check permissions
  const existingRunbook = await db
    .select()
    .from(runbooks)
    .where(eq(runbooks.id, parseInt(id)))
    .limit(1);

  if (!existingRunbook[0]) {
    throw new Error('Runbook not found');
  }

  if (
    existingRunbook[0].organizationId &&
    existingRunbook[0].organizationId !== team.id
  ) {
    throw new Error('Unauthorized');
  }

  // Delete runbook (steps will cascade)
  await db
    .delete(runbooks)
    .where(eq(runbooks.id, parseInt(id)));

  revalidatePath('/runbooks');
}

// Execution-related functions
export async function createExecution(data: {
  runbookId: string;
  incidentId?: string;
}) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // In a real implementation, you would create an execution record
  // For now, return a mock execution ID
  return `exec-${Date.now()}`;
}

export async function updateExecutionStep(
  executionId: string,
  stepId: string,
  data: {
    status: string;
    notes?: string;
  }
) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // In a real implementation, you would update the execution step record
  // For now, just return success
  return true;
}