import { db } from '@/lib/db/drizzle';
import {
  tabletopExercises,
  exerciseCompletions
} from './schema-ir';
import { eq, and, sql, desc, gte, isNotNull, isNull } from 'drizzle-orm';

export async function getUserExerciseHistory(userId: number, filters?: {
  status?: 'completed' | 'in_progress' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
}) {
  let query = db
    .select({
      id: exerciseCompletions.id,
      exerciseId: exerciseCompletions.exerciseId,
      exercise: tabletopExercises,
      startedAt: exerciseCompletions.startedAt,
      completedAt: exerciseCompletions.completedAt,
      score: exerciseCompletions.score,
      totalScore: exerciseCompletions.totalScore,
      certificateUrl: exerciseCompletions.certificateUrl,
      answers: exerciseCompletions.answers
    })
    .from(exerciseCompletions)
    .innerJoin(tabletopExercises, eq(tabletopExercises.id, exerciseCompletions.exerciseId))
    .where(eq(exerciseCompletions.userId, userId))
    .$dynamic();

  // Apply filters
  if (filters?.status === 'completed') {
    query = query.where(isNotNull(exerciseCompletions.completedAt));
  } else if (filters?.status === 'in_progress') {
    query = query.where(isNull(exerciseCompletions.completedAt));
  }

  if (filters?.dateFrom) {
    query = query.where(gte(exerciseCompletions.startedAt, filters.dateFrom));
  }

  if (filters?.dateTo) {
    query = query.where(sql`${exerciseCompletions.startedAt} <= ${filters.dateTo}`);
  }

  const results = await query.orderBy(desc(exerciseCompletions.startedAt));

  // Process results to add calculated fields
  return results.map(row => {
    const timeTaken = row.completedAt && row.startedAt
      ? Math.round((new Date(row.completedAt).getTime() - new Date(row.startedAt).getTime()) / 60000)
      : 0;

    const answers = row.answers as Record<number, string> || {};
    const progress = row.completedAt ? 100 : Math.round((Object.keys(answers).length / 10) * 100); // Estimate based on answers

    return {
      ...row,
      status: row.completedAt ? 'completed' as const : 'in_progress' as const,
      timeTaken,
      progress
    };
  });
}

export async function getUserStats(userId: number) {
  // Get basic stats
  const basicStats = await db
    .select({
      totalCompleted: sql<number>`COUNT(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL THEN 1 END)`.as('total_completed'),
      totalInProgress: sql<number>`COUNT(CASE WHEN ${exerciseCompletions.completedAt} IS NULL THEN 1 END)`.as('total_in_progress'),
      totalScore: sql<number>`COALESCE(SUM(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL THEN ${exerciseCompletions.score} END), 0)`.as('total_score'),
      totalPossible: sql<number>`COALESCE(SUM(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL THEN ${exerciseCompletions.totalScore} END), 0)`.as('total_possible'),
      totalTime: sql<number>`COALESCE(SUM(
        CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL
        THEN EXTRACT(EPOCH FROM (${exerciseCompletions.completedAt} - ${exerciseCompletions.startedAt})) / 60
        END
      ), 0)`.as('total_time'),
      certificatesEarned: sql<number>`COUNT(CASE WHEN ${exerciseCompletions.certificateUrl} IS NOT NULL THEN 1 END)`.as('certificates_earned')
    })
    .from(exerciseCompletions)
    .where(eq(exerciseCompletions.userId, userId));

  const averageScore = basicStats[0]?.totalPossible > 0
    ? (basicStats[0].totalScore / basicStats[0].totalPossible) * 100
    : 0;

  // Get progress over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const progressData = await db
    .select({
      date: sql<string>`DATE(${exerciseCompletions.completedAt})`.as('date'),
      exercises: sql<number>`COUNT(*)`.as('exercises'),
      avgScore: sql<number>`AVG(${exerciseCompletions.score}::float / ${exerciseCompletions.totalScore} * 100)`.as('avg_score')
    })
    .from(exerciseCompletions)
    .where(and(
      eq(exerciseCompletions.userId, userId),
      isNotNull(exerciseCompletions.completedAt),
      gte(exerciseCompletions.completedAt, thirtyDaysAgo)
    ))
    .groupBy(sql`DATE(${exerciseCompletions.completedAt})`)
    .orderBy(sql`DATE(${exerciseCompletions.completedAt})`);

  // Get performance by category
  const categoryPerformance = await db
    .select({
      category: tabletopExercises.category,
      avgScore: sql<number>`AVG(${exerciseCompletions.score}::float / ${exerciseCompletions.totalScore} * 100)`.as('avg_score'),
      count: sql<number>`COUNT(*)`.as('count')
    })
    .from(exerciseCompletions)
    .innerJoin(tabletopExercises, eq(tabletopExercises.id, exerciseCompletions.exerciseId))
    .where(and(
      eq(exerciseCompletions.userId, userId),
      isNotNull(exerciseCompletions.completedAt)
    ))
    .groupBy(tabletopExercises.category);

  // Get difficulty distribution
  const difficultyDistribution = await db
    .select({
      difficulty: tabletopExercises.difficulty,
      count: sql<number>`COUNT(*)`.as('count'),
      avgScore: sql<number>`AVG(${exerciseCompletions.score}::float / ${exerciseCompletions.totalScore} * 100)`.as('avg_score')
    })
    .from(exerciseCompletions)
    .innerJoin(tabletopExercises, eq(tabletopExercises.id, exerciseCompletions.exerciseId))
    .where(and(
      eq(exerciseCompletions.userId, userId),
      isNotNull(exerciseCompletions.completedAt)
    ))
    .groupBy(tabletopExercises.difficulty);

  // Calculate learning path progress (simplified)
  const totalExercises = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tabletopExercises)
    .where(eq(tabletopExercises.isActive, true));

  const learningPathProgress = totalExercises[0]?.count > 0
    ? Math.round((basicStats[0].totalCompleted / totalExercises[0].count) * 100)
    : 0;

  // Mock recent achievements (you can expand this)
  const recentAchievements = [];
  if (basicStats[0].totalCompleted >= 5) {
    recentAchievements.push({
      title: 'Getting Started',
      description: 'Completed 5 exercises'
    });
  }
  if (basicStats[0].totalCompleted >= 10) {
    recentAchievements.push({
      title: 'Dedicated Learner',
      description: 'Completed 10 exercises'
    });
  }
  if (averageScore >= 90) {
    recentAchievements.push({
      title: 'High Achiever',
      description: 'Maintained 90%+ average score'
    });
  }

  return {
    totalCompleted: basicStats[0]?.totalCompleted || 0,
    totalInProgress: basicStats[0]?.totalInProgress || 0,
    averageScore,
    totalTime: Math.round(basicStats[0]?.totalTime || 0),
    certificatesEarned: basicStats[0]?.certificatesEarned || 0,
    progressData: progressData.map(d => ({
      date: d.date,
      exercises: Number(d.exercises),
      score: Math.round(d.avgScore || 0)
    })),
    categoryPerformance: categoryPerformance.map(c => ({
      name: c.category || 'Uncategorized',
      averageScore: c.avgScore || 0,
      count: Number(c.count)
    })),
    difficultyDistribution: difficultyDistribution.map(d => ({
      difficulty: d.difficulty,
      count: Number(d.count),
      averageScore: d.avgScore || 0
    })),
    learningPathProgress,
    recentAchievements
  };
}