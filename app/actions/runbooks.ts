'use server';

import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db';
import {
  runbooks,
  runbookSteps,
  runbookExecutions,
  stepExecutions,
  executionEvidence,
  type RunbookExecution,
  type StepExecution as StepExecutionType,
  type ExecutionEvidence as ExecutionEvidenceType
} from '@/lib/db/schema-ir';
import { tags, taggables } from '@/lib/db/schema-tags';
import { eq, and, or, like, desc, asc, count } from 'drizzle-orm';
import { users } from '@/lib/db/schema';
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

  const team = await getTeamForUser();
  if (!team) {
    throw new Error('Team not found');
  }

  // Get runbook to count steps
  const runbook = await getRunbook(data.runbookId);
  if (!runbook) {
    throw new Error('Runbook not found');
  }

  // Create execution record
  const [execution] = await db
    .insert(runbookExecutions)
    .values({
      runbookId: parseInt(data.runbookId),
      incidentId: data.incidentId ? parseInt(data.incidentId) : null,
      organizationId: team.id,
      executorId: user.id,
      totalSteps: runbook.steps.length,
      status: 'in_progress',
    })
    .returning();

  // Create step execution records
  const stepExecutionData = runbook.steps.map((step: any, index: number) => ({
    executionId: execution.id,
    stepId: step.id,
    stepIndex: index,
    status: index === 0 ? 'in_progress' as const : 'pending' as const,
  }));

  await db.insert(stepExecutions).values(stepExecutionData);

  return execution.id.toString();
}

export async function getExecution(executionId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const execution = await db
    .select()
    .from(runbookExecutions)
    .where(eq(runbookExecutions.id, parseInt(executionId)))
    .limit(1);

  if (!execution[0]) {
    return null;
  }

  // Get step executions
  const steps = await db
    .select()
    .from(stepExecutions)
    .where(eq(stepExecutions.executionId, parseInt(executionId)))
    .orderBy(asc(stepExecutions.stepIndex));

  return {
    ...execution[0],
    stepExecutions: steps,
  };
}

export async function updateExecutionStep(
  executionId: string,
  stepId: string,
  data: {
    status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
    notes?: string;
    evidence?: Array<{ fileName: string; fileUrl: string; fileSize?: number; fileType?: string; description?: string }>;
  }
) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const now = new Date();
  const updateData: any = {
    status: data.status,
    updatedAt: now,
  };

  if (data.status === 'in_progress') {
    updateData.startedAt = now;
    updateData.executedBy = user.id;
  } else if (data.status === 'completed' || data.status === 'skipped') {
    updateData.completedAt = now;
    updateData.executedBy = user.id;

    // Calculate duration if started
    const stepExecution = await db
      .select()
      .from(stepExecutions)
      .where(
        and(
          eq(stepExecutions.executionId, parseInt(executionId)),
          eq(stepExecutions.stepId, parseInt(stepId))
        )
      )
      .limit(1);

    if (stepExecution[0]?.startedAt) {
      updateData.duration = Math.floor((now.getTime() - stepExecution[0].startedAt.getTime()) / 1000);
      updateData.actualDuration = Math.floor(updateData.duration / 60);
    }
  }

  if (data.notes) {
    updateData.notes = data.notes;
  }

  // Update step execution
  await db
    .update(stepExecutions)
    .set(updateData)
    .where(
      and(
        eq(stepExecutions.executionId, parseInt(executionId)),
        eq(stepExecutions.stepId, parseInt(stepId))
      )
    );

  // Add evidence if provided
  if (data.evidence && data.evidence.length > 0) {
    const evidenceData = data.evidence.map(evidence => ({
      executionId: parseInt(executionId),
      stepId: parseInt(stepId),
      fileName: evidence.fileName,
      fileUrl: evidence.fileUrl,
      fileSize: evidence.fileSize,
      fileType: evidence.fileType,
      description: evidence.description,
      uploadedBy: user.id,
    }));

    await db.insert(executionEvidence).values(evidenceData);
  }

  // Update overall execution progress
  const completedStepsCount = await db
    .select({ count: eq(stepExecutions.status, 'completed') })
    .from(stepExecutions)
    .where(eq(stepExecutions.executionId, parseInt(executionId)));

  await db
    .update(runbookExecutions)
    .set({
      completedSteps: completedStepsCount.length,
      updatedAt: now,
    })
    .where(eq(runbookExecutions.id, parseInt(executionId)));

  return true;
}

export async function pauseExecution(executionId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  await db
    .update(runbookExecutions)
    .set({
      status: 'paused',
      pausedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(runbookExecutions.id, parseInt(executionId)));

  return true;
}

export async function resumeExecution(executionId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const execution = await db
    .select()
    .from(runbookExecutions)
    .where(eq(runbookExecutions.id, parseInt(executionId)))
    .limit(1);

  if (!execution[0]) {
    throw new Error('Execution not found');
  }

  const now = new Date();
  let pausedDuration = execution[0].pausedDuration || 0;

  if (execution[0].pausedAt) {
    pausedDuration += Math.floor((now.getTime() - execution[0].pausedAt.getTime()) / 1000);
  }

  await db
    .update(runbookExecutions)
    .set({
      status: 'in_progress',
      resumedAt: now,
      pausedDuration,
      updatedAt: now,
    })
    .where(eq(runbookExecutions.id, parseInt(executionId)));

  return true;
}

export async function completeExecution(executionId: string, notes?: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const execution = await db
    .select()
    .from(runbookExecutions)
    .where(eq(runbookExecutions.id, parseInt(executionId)))
    .limit(1);

  if (!execution[0]) {
    throw new Error('Execution not found');
  }

  const now = new Date();
  const totalDuration = Math.floor((now.getTime() - execution[0].startedAt.getTime()) / 1000);
  const effectiveDuration = totalDuration - (execution[0].pausedDuration || 0);

  await db
    .update(runbookExecutions)
    .set({
      status: 'completed',
      completedAt: now,
      totalDuration: effectiveDuration,
      executionNotes: notes,
      updatedAt: now,
    })
    .where(eq(runbookExecutions.id, parseInt(executionId)));

  return true;
}

export async function getExecutionReport(executionId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get execution with runbook details
  const execution = await db
    .select({
      execution: runbookExecutions,
      runbook: runbooks,
      executor: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(runbookExecutions)
    .innerJoin(runbooks, eq(runbookExecutions.runbookId, runbooks.id))
    .innerJoin(users, eq(runbookExecutions.executorId, users.id))
    .where(eq(runbookExecutions.id, parseInt(executionId)))
    .limit(1);

  if (!execution[0]) {
    throw new Error('Execution not found');
  }

  // Get step executions with step details
  const stepDetails = await db
    .select({
      stepExecution: stepExecutions,
      step: runbookSteps,
      executedBy: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(stepExecutions)
    .innerJoin(runbookSteps, eq(stepExecutions.stepId, runbookSteps.id))
    .leftJoin(users, eq(stepExecutions.executedBy, users.id))
    .where(eq(stepExecutions.executionId, parseInt(executionId)))
    .orderBy(asc(stepExecutions.stepIndex));

  // Get evidence
  const evidence = await db
    .select({
      evidence: executionEvidence,
      uploader: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(executionEvidence)
    .innerJoin(users, eq(executionEvidence.uploadedBy, users.id))
    .where(eq(executionEvidence.executionId, parseInt(executionId)));

  return {
    execution: execution[0],
    steps: stepDetails,
    evidence,
    summary: {
      totalSteps: stepDetails.length,
      completedSteps: stepDetails.filter(s => s.stepExecution.status === 'completed').length,
      skippedSteps: stepDetails.filter(s => s.stepExecution.status === 'skipped').length,
      totalDuration: execution[0].execution.totalDuration,
      evidenceCount: evidence.length,
    },
  };
}

export async function uploadExecutionEvidence(
  executionId: string,
  stepId: string,
  evidence: {
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    fileType?: string;
    description?: string;
  }
) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const [newEvidence] = await db
    .insert(executionEvidence)
    .values({
      executionId: parseInt(executionId),
      stepId: parseInt(stepId),
      fileName: evidence.fileName,
      fileUrl: evidence.fileUrl,
      fileSize: evidence.fileSize,
      fileType: evidence.fileType,
      description: evidence.description,
      uploadedBy: user.id,
    })
    .returning();

  return newEvidence;
}

export async function getStepEvidence(executionId: string, stepId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const evidence = await db
    .select({
      evidence: executionEvidence,
      uploader: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(executionEvidence)
    .innerJoin(users, eq(executionEvidence.uploadedBy, users.id))
    .where(
      and(
        eq(executionEvidence.executionId, parseInt(executionId)),
        eq(executionEvidence.stepId, parseInt(stepId))
      )
    )
    .orderBy(desc(executionEvidence.uploadedAt));

  return evidence;
}