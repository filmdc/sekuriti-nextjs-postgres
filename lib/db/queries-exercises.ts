import { db } from '@/lib/db/drizzle';
import {
  tabletopExercises,
  exerciseQuestions,
  exerciseCompletions,
  TabletopExercise,
  ExerciseQuestion
} from './schema-ir';
import { users } from './schema';
import { eq, desc, and, sql, gte, lte } from 'drizzle-orm';

export interface ExerciseWithQuestions extends TabletopExercise {
  questions: ExerciseQuestion[];
  completionCount?: number;
  averageScore?: number;
  userStatus?: {
    status: 'not_started' | 'in_progress' | 'completed';
    progress?: number;
    score?: number;
    totalScore?: number;
  };
}

export async function getExercises(filters?: {
  categories?: string[];
  difficulty?: string;
  sort?: string;
}) {
  let query = db
    .select({
      exercise: tabletopExercises,
      completionCount: sql<number>`COUNT(DISTINCT ${exerciseCompletions.userId})`.as('completion_count'),
      averageScore: sql<number>`AVG(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL
        THEN (${exerciseCompletions.score}::float / ${exerciseCompletions.totalScore} * 100) END)`.as('average_score')
    })
    .from(tabletopExercises)
    .leftJoin(exerciseCompletions, eq(exerciseCompletions.exerciseId, tabletopExercises.id))
    .where(eq(tabletopExercises.isActive, true))
    .groupBy(tabletopExercises.id);

  // Apply filters
  if (filters?.categories && filters.categories.length > 0) {
    query = query.where(sql`${tabletopExercises.category} = ANY(${filters.categories})`);
  }

  if (filters?.difficulty) {
    query = query.where(eq(tabletopExercises.difficulty, filters.difficulty));
  }

  // Apply sorting
  switch (filters?.sort) {
    case 'popular':
      query = query.orderBy(desc(sql`completion_count`));
      break;
    case 'difficulty-asc':
      query = query.orderBy(sql`
        CASE ${tabletopExercises.difficulty}
          WHEN 'beginner' THEN 1
          WHEN 'intermediate' THEN 2
          WHEN 'advanced' THEN 3
        END
      `);
      break;
    case 'difficulty-desc':
      query = query.orderBy(sql`
        CASE ${tabletopExercises.difficulty}
          WHEN 'advanced' THEN 1
          WHEN 'intermediate' THEN 2
          WHEN 'beginner' THEN 3
        END
      `);
      break;
    case 'duration':
      query = query.orderBy(tabletopExercises.estimatedDuration);
      break;
    default:
      query = query.orderBy(desc(tabletopExercises.createdAt));
  }

  const results = await query;

  return results.map(row => ({
    ...row.exercise,
    completionCount: row.completionCount || 0,
    averageScore: row.averageScore || 0
  }));
}

export async function getExerciseById(id: number): Promise<ExerciseWithQuestions | null> {
  const exerciseData = await db
    .select()
    .from(tabletopExercises)
    .where(eq(tabletopExercises.id, id))
    .limit(1);

  if (exerciseData.length === 0) {
    return null;
  }

  const questions = await db
    .select()
    .from(exerciseQuestions)
    .where(eq(exerciseQuestions.exerciseId, id))
    .orderBy(exerciseQuestions.questionNumber);

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return {
    ...exerciseData[0],
    questions,
    totalPoints
  };
}

export async function getExerciseStats(exerciseId: number) {
  const stats = await db
    .select({
      completionCount: sql<number>`COUNT(*)`.as('completion_count'),
      averageScore: sql<number>`AVG(${exerciseCompletions.score}::float / ${exerciseCompletions.totalScore} * 100)`.as('average_score'),
      successRate: sql<number>`AVG(CASE WHEN ${exerciseCompletions.score}::float / ${exerciseCompletions.totalScore} >= 0.7 THEN 1 ELSE 0 END) * 100`.as('success_rate')
    })
    .from(exerciseCompletions)
    .where(and(
      eq(exerciseCompletions.exerciseId, exerciseId),
      sql`${exerciseCompletions.completedAt} IS NOT NULL`
    ));

  return {
    completionCount: stats[0]?.completionCount || 0,
    averageScore: stats[0]?.averageScore || 0,
    successRate: stats[0]?.successRate || 0
  };
}

export async function startExercise(userId: number, exerciseId: number) {
  // Check if there's an existing incomplete session
  const existing = await db
    .select()
    .from(exerciseCompletions)
    .where(and(
      eq(exerciseCompletions.userId, userId),
      eq(exerciseCompletions.exerciseId, exerciseId),
      sql`${exerciseCompletions.completedAt} IS NULL`
    ))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new session
  const exercise = await getExerciseById(exerciseId);
  if (!exercise) {
    throw new Error('Exercise not found');
  }

  const totalScore = exercise.questions.reduce((sum, q) => sum + (q.points || 1), 0);

  const [session] = await db
    .insert(exerciseCompletions)
    .values({
      exerciseId,
      userId,
      organizationId: 1, // TODO: Get from user's organization
      startedAt: new Date(),
      totalScore,
      score: 0,
      answers: {}
    })
    .returning();

  return session;
}

export async function saveExerciseProgress(
  sessionId: number,
  answers: Record<number, string>,
  currentQuestion?: number,
  timeRemaining?: number
) {
  const metadata = {
    currentQuestion,
    timeRemaining,
    lastSaved: new Date().toISOString()
  };

  await db
    .update(exerciseCompletions)
    .set({
      answers,
      feedback: JSON.stringify(metadata)
    })
    .where(eq(exerciseCompletions.id, sessionId));
}

export async function submitExercise(sessionId: number, finalAnswers: Record<number, string>) {
  const [session] = await db
    .select()
    .from(exerciseCompletions)
    .where(eq(exerciseCompletions.id, sessionId))
    .limit(1);

  if (!session) {
    throw new Error('Session not found');
  }

  const exercise = await getExerciseById(session.exerciseId);
  if (!exercise) {
    throw new Error('Exercise not found');
  }

  // Calculate score
  let score = 0;
  exercise.questions.forEach((question) => {
    if (finalAnswers[question.id] === question.correctAnswer) {
      score += question.points || 1;
    }
  });

  // Generate certificate if passed (70% or higher)
  const percentage = (score / session.totalScore) * 100;
  const certificateUrl = percentage >= 70
    ? `/api/exercises/certificate/${sessionId}`
    : null;

  // Update completion
  await db
    .update(exerciseCompletions)
    .set({
      answers: finalAnswers,
      score,
      completedAt: new Date(),
      certificateUrl
    })
    .where(eq(exerciseCompletions.id, sessionId));

  return {
    score,
    totalScore: session.totalScore,
    percentage,
    passed: percentage >= 70,
    certificateUrl
  };
}