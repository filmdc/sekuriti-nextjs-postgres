import { db } from '@/lib/db/drizzle';
import {
  tabletopExercises,
  exerciseCompletions,
  exerciseQuestions
} from './schema-ir';
import { eq, and, sql, desc, isNotNull, isNull } from 'drizzle-orm';

export async function getUserProgress(userId: number) {
  const completions = await db
    .select({
      completedCount: sql<number>`COUNT(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL THEN 1 END)`.as('completed_count'),
      inProgressCount: sql<number>`COUNT(CASE WHEN ${exerciseCompletions.completedAt} IS NULL THEN 1 END)`.as('in_progress_count'),
      totalScore: sql<number>`SUM(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL THEN ${exerciseCompletions.score} END)`.as('total_score'),
      totalPossible: sql<number>`SUM(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL THEN ${exerciseCompletions.totalScore} END)`.as('total_possible'),
      totalPoints: sql<number>`COALESCE(SUM(${exerciseCompletions.score}), 0)`.as('total_points')
    })
    .from(exerciseCompletions)
    .where(eq(exerciseCompletions.userId, userId));

  const averageScore = completions[0]?.totalPossible
    ? Math.round((completions[0].totalScore / completions[0].totalPossible) * 100)
    : 0;

  // Get recommended exercises based on user's performance
  const recommended = await getRecommendedExercises(userId);

  return {
    completedCount: completions[0]?.completedCount || 0,
    inProgressCount: completions[0]?.inProgressCount || 0,
    averageScore,
    totalPoints: completions[0]?.totalPoints || 0,
    recommended
  };
}

export async function getUserExerciseStatus(userId: number, exerciseId: number) {
  const completion = await db
    .select()
    .from(exerciseCompletions)
    .where(and(
      eq(exerciseCompletions.userId, userId),
      eq(exerciseCompletions.exerciseId, exerciseId)
    ))
    .orderBy(desc(exerciseCompletions.startedAt))
    .limit(1);

  if (completion.length === 0) {
    return { status: 'not_started' as const };
  }

  const record = completion[0];

  if (record.completedAt) {
    return {
      status: 'completed' as const,
      score: record.score,
      totalScore: record.totalScore,
      completedAt: record.completedAt
    };
  }

  // Calculate progress
  const answers = record.answers as Record<number, string> || {};
  const questions = await db
    .select()
    .from(exerciseQuestions)
    .where(eq(exerciseQuestions.exerciseId, exerciseId));

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return {
    status: 'in_progress' as const,
    progress,
    startedAt: record.startedAt
  };
}

async function getRecommendedExercises(userId: number, limit = 3) {
  // Get user's completed exercises and their categories
  const userHistory = await db
    .select({
      category: tabletopExercises.category,
      difficulty: tabletopExercises.difficulty,
      score: exerciseCompletions.score,
      totalScore: exerciseCompletions.totalScore
    })
    .from(exerciseCompletions)
    .innerJoin(tabletopExercises, eq(tabletopExercises.id, exerciseCompletions.exerciseId))
    .where(and(
      eq(exerciseCompletions.userId, userId),
      isNotNull(exerciseCompletions.completedAt)
    ));

  if (userHistory.length === 0) {
    // Return beginner exercises for new users
    return db
      .select()
      .from(tabletopExercises)
      .where(and(
        eq(tabletopExercises.difficulty, 'beginner'),
        eq(tabletopExercises.isActive, true)
      ))
      .limit(limit);
  }

  // Analyze user's performance
  const categoryScores: Record<string, { total: number; count: number }> = {};
  let overallAverage = 0;
  let totalExercises = 0;

  userHistory.forEach((record) => {
    const percentage = (record.score / record.totalScore) * 100;
    overallAverage += percentage;
    totalExercises++;

    if (record.category) {
      if (!categoryScores[record.category]) {
        categoryScores[record.category] = { total: 0, count: 0 };
      }
      categoryScores[record.category].total += percentage;
      categoryScores[record.category].count++;
    }
  });

  overallAverage = overallAverage / totalExercises;

  // Find weak categories (below 70%)
  const weakCategories = Object.entries(categoryScores)
    .filter(([_, scores]) => (scores.total / scores.count) < 70)
    .map(([category]) => category);

  // Determine recommended difficulty
  let recommendedDifficulty = 'intermediate';
  if (overallAverage < 60) {
    recommendedDifficulty = 'beginner';
  } else if (overallAverage > 85) {
    recommendedDifficulty = 'advanced';
  }

  // Get uncompleted exercises
  const completedIds = await db
    .select({ exerciseId: exerciseCompletions.exerciseId })
    .from(exerciseCompletions)
    .where(and(
      eq(exerciseCompletions.userId, userId),
      isNotNull(exerciseCompletions.completedAt)
    ));

  const completedExerciseIds = completedIds.map(c => c.exerciseId);

  // Build recommendation query
  let recommendationQuery = db
    .select()
    .from(tabletopExercises)
    .where(and(
      eq(tabletopExercises.isActive, true),
      sql`${tabletopExercises.id} NOT IN (${completedExerciseIds.length > 0 ? completedExerciseIds : [0]})`
    ));

  if (weakCategories.length > 0) {
    recommendationQuery = recommendationQuery.where(
      sql`${tabletopExercises.category} = ANY(${weakCategories})`
    );
  }

  const recommendations = await recommendationQuery
    .orderBy(sql`
      CASE ${tabletopExercises.difficulty}
        WHEN ${recommendedDifficulty} THEN 0
        ELSE 1
      END
    `)
    .limit(limit);

  return recommendations;
}