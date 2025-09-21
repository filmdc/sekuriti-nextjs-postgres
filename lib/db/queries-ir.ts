import { desc, and, eq, isNull, like, or, gte, lte, sql } from 'drizzle-orm';
import { db } from './drizzle';
import {
  incidents,
  assets,
  runbooks,
  incidentAssets,
  incidentEvidence,
  communicationTemplates,
  insurancePolicies,
  tabletopExercises,
  exerciseQuestions,
  exerciseCompletions,
  runbookSteps
} from './schema-ir';
import { teams, users } from './schema';

// Incident queries
export async function getIncidents(organizationId: number, filters?: {
  status?: string;
  severity?: string;
  classification?: string;
  search?: string;
}) {
  let query = db.select({
    incident: incidents,
    reporter: users,
    assignee: users
  })
  .from(incidents)
  .leftJoin(users, eq(incidents.reportedBy, users.id))
  .where(eq(incidents.organizationId, organizationId));

  if (filters?.status) {
    query = query.where(eq(incidents.status, filters.status as any));
  }
  if (filters?.severity) {
    query = query.where(eq(incidents.severity, filters.severity as any));
  }
  if (filters?.classification) {
    query = query.where(eq(incidents.classification, filters.classification as any));
  }
  if (filters?.search) {
    query = query.where(
      or(
        like(incidents.title, `%${filters.search}%`),
        like(incidents.referenceNumber, `%${filters.search}%`),
        like(incidents.description, `%${filters.search}%`)
      )
    );
  }

  return query.orderBy(desc(incidents.createdAt));
}

export async function getIncidentById(id: number, organizationId: number) {
  const result = await db
    .select()
    .from(incidents)
    .where(
      and(
        eq(incidents.id, id),
        eq(incidents.organizationId, organizationId)
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  // Get affected assets
  const affectedAssets = await db
    .select({
      asset: assets,
      linkData: incidentAssets
    })
    .from(incidentAssets)
    .innerJoin(assets, eq(incidentAssets.assetId, assets.id))
    .where(eq(incidentAssets.incidentId, id));

  // Get evidence
  const evidence = await db
    .select()
    .from(incidentEvidence)
    .where(eq(incidentEvidence.incidentId, id))
    .orderBy(desc(incidentEvidence.uploadedAt));

  // Get runbook if linked
  let runbook = null;
  if (result[0].runbookId) {
    const runbookResult = await db
      .select()
      .from(runbooks)
      .where(eq(runbooks.id, result[0].runbookId))
      .limit(1);

    if (runbookResult.length > 0) {
      const steps = await db
        .select()
        .from(runbookSteps)
        .where(eq(runbookSteps.runbookId, runbookResult[0].id))
        .orderBy(runbookSteps.stepNumber);

      runbook = {
        ...runbookResult[0],
        steps
      };
    }
  }

  return {
    ...result[0],
    affectedAssets,
    evidence,
    runbook
  };
}

export async function createIncident(data: {
  organizationId: number;
  title: string;
  description?: string;
  classification: string;
  severity: string;
  reportedBy: number;
  assignedTo?: number;
  runbookId?: number;
}) {
  // Generate reference number
  const referenceNumber = await generateIncidentReference(data.organizationId);

  const result = await db.insert(incidents).values({
    ...data,
    referenceNumber,
    status: 'open',
    classification: data.classification as any,
    severity: data.severity as any,
  }).returning();

  return result[0];
}

async function generateIncidentReference(organizationId: number): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');

  // Get count of incidents for this org this month
  const startOfMonth = new Date(year, new Date().getMonth(), 1);
  const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);

  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(incidents)
    .where(
      and(
        eq(incidents.organizationId, organizationId),
        gte(incidents.createdAt, startOfMonth),
        lte(incidents.createdAt, endOfMonth)
      )
    );

  const incidentNumber = String((count[0]?.count || 0) + 1).padStart(4, '0');
  return `INC-${year}${month}-${incidentNumber}`;
}

// Asset queries
export async function getAssets(organizationId: number, filters?: {
  type?: string;
  search?: string;
  mustContact?: boolean;
}) {
  let query = db.select()
    .from(assets)
    .where(
      and(
        eq(assets.organizationId, organizationId),
        isNull(assets.deletedAt)
      )
    );

  if (filters?.type) {
    query = query.where(eq(assets.type, filters.type as any));
  }
  if (filters?.mustContact !== undefined) {
    query = query.where(eq(assets.mustContact, filters.mustContact));
  }
  if (filters?.search) {
    query = query.where(
      or(
        like(assets.name, `%${filters.search}%`),
        like(assets.description, `%${filters.search}%`),
        like(assets.vendor, `%${filters.search}%`)
      )
    );
  }

  return query.orderBy(desc(assets.createdAt));
}

export async function getAssetById(id: number, organizationId: number) {
  const result = await db
    .select()
    .from(assets)
    .where(
      and(
        eq(assets.id, id),
        eq(assets.organizationId, organizationId),
        isNull(assets.deletedAt)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Runbook queries
export async function getRunbooks(organizationId: number) {
  return db
    .select()
    .from(runbooks)
    .where(
      and(
        or(
          eq(runbooks.organizationId, organizationId),
          eq(runbooks.isTemplate, true)
        ),
        eq(runbooks.isActive, true)
      )
    )
    .orderBy(desc(runbooks.createdAt));
}

export async function getRunbookWithSteps(id: number, organizationId: number) {
  const runbookResult = await db
    .select()
    .from(runbooks)
    .where(
      and(
        eq(runbooks.id, id),
        or(
          eq(runbooks.organizationId, organizationId),
          eq(runbooks.isTemplate, true)
        )
      )
    )
    .limit(1);

  if (runbookResult.length === 0) return null;

  const steps = await db
    .select()
    .from(runbookSteps)
    .where(eq(runbookSteps.runbookId, id))
    .orderBy(runbookSteps.phase, runbookSteps.stepNumber);

  return {
    ...runbookResult[0],
    steps
  };
}

// Communication template queries
export async function getCommunicationTemplates(organizationId: number) {
  return db
    .select()
    .from(communicationTemplates)
    .where(
      or(
        eq(communicationTemplates.organizationId, organizationId),
        eq(communicationTemplates.isDefault, true)
      )
    )
    .orderBy(desc(communicationTemplates.createdAt));
}

// Insurance policy queries
export async function getInsurancePolicies(organizationId: number) {
  return db
    .select()
    .from(insurancePolicies)
    .where(eq(insurancePolicies.organizationId, organizationId))
    .orderBy(desc(insurancePolicies.endDate));
}

// Tabletop exercise queries
export async function getTabletopExercises() {
  return db
    .select()
    .from(tabletopExercises)
    .where(eq(tabletopExercises.isActive, true))
    .orderBy(desc(tabletopExercises.createdAt));
}

export async function getExerciseWithQuestions(id: number) {
  const exerciseResult = await db
    .select()
    .from(tabletopExercises)
    .where(eq(tabletopExercises.id, id))
    .limit(1);

  if (exerciseResult.length === 0) return null;

  const questions = await db
    .select()
    .from(exerciseQuestions)
    .where(eq(exerciseQuestions.exerciseId, id))
    .orderBy(exerciseQuestions.questionNumber);

  return {
    ...exerciseResult[0],
    questions
  };
}

export async function getUserExerciseCompletions(userId: number, organizationId: number) {
  return db
    .select({
      completion: exerciseCompletions,
      exercise: tabletopExercises
    })
    .from(exerciseCompletions)
    .innerJoin(tabletopExercises, eq(exerciseCompletions.exerciseId, tabletopExercises.id))
    .where(
      and(
        eq(exerciseCompletions.userId, userId),
        eq(exerciseCompletions.organizationId, organizationId)
      )
    )
    .orderBy(desc(exerciseCompletions.completedAt));
}

// Dashboard statistics
export async function getDashboardStats(organizationId: number) {
  const [
    openIncidents,
    totalAssets,
    completedExercises,
    activeRunbooks
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(incidents)
      .where(
        and(
          eq(incidents.organizationId, organizationId),
          eq(incidents.status, 'open')
        )
      ),
    db.select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(
        and(
          eq(assets.organizationId, organizationId),
          isNull(assets.deletedAt)
        )
      ),
    db.select({ count: sql<number>`count(*)` })
      .from(exerciseCompletions)
      .where(eq(exerciseCompletions.organizationId, organizationId)),
    db.select({ count: sql<number>`count(*)` })
      .from(runbooks)
      .where(
        and(
          eq(runbooks.organizationId, organizationId),
          eq(runbooks.isActive, true)
        )
      )
  ]);

  return {
    openIncidents: openIncidents[0]?.count || 0,
    totalAssets: totalAssets[0]?.count || 0,
    completedExercises: completedExercises[0]?.count || 0,
    activeRunbooks: activeRunbooks[0]?.count || 0
  };
}