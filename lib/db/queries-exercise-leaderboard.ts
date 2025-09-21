import { db } from '@/lib/db/drizzle';
import {
  exerciseCompletions
} from './schema-ir';
import { users } from './schema';
import { eq, and, sql, desc, gte, isNotNull } from 'drizzle-orm';

export async function getLeaderboard(period: 'all' | 'month' | 'week' = 'all') {
  let dateFilter = sql`1=1`;

  if (period === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = sql`${exerciseCompletions.completedAt} >= ${monthAgo}`;
  } else if (period === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = sql`${exerciseCompletions.completedAt} >= ${weekAgo}`;
  }

  const leaderboardData = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      totalPoints: sql<number>`COALESCE(SUM(${exerciseCompletions.score}), 0)`.as('total_points'),
      exercisesCompleted: sql<number>`COUNT(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL THEN 1 END)`.as('exercises_completed'),
      averageScore: sql<number>`AVG(CASE WHEN ${exerciseCompletions.completedAt} IS NOT NULL
        THEN ${exerciseCompletions.score}::float / ${exerciseCompletions.totalScore} * 100 END)`.as('average_score'),
      monthlyPoints: sql<number>`COALESCE(SUM(
        CASE WHEN ${exerciseCompletions.completedAt} >= CURRENT_DATE - INTERVAL '30 days'
        THEN ${exerciseCompletions.score} END
      ), 0)`.as('monthly_points'),
      monthlyExercises: sql<number>`COUNT(
        CASE WHEN ${exerciseCompletions.completedAt} >= CURRENT_DATE - INTERVAL '30 days'
        THEN 1 END
      )`.as('monthly_exercises'),
      weeklyPoints: sql<number>`COALESCE(SUM(
        CASE WHEN ${exerciseCompletions.completedAt} >= CURRENT_DATE - INTERVAL '7 days'
        THEN ${exerciseCompletions.score} END
      ), 0)`.as('weekly_points'),
      weeklyExercises: sql<number>`COUNT(
        CASE WHEN ${exerciseCompletions.completedAt} >= CURRENT_DATE - INTERVAL '7 days'
        THEN 1 END
      )`.as('weekly_exercises')
    })
    .from(users)
    .leftJoin(exerciseCompletions, eq(exerciseCompletions.userId, users.id))
    .where(and(dateFilter))
    .groupBy(users.id, users.name, users.email)
    .orderBy(desc(sql`total_points`));

  // Add rank trends (simplified - you'd need to track historical rankings for real trends)
  return leaderboardData.map((user, index) => ({
    id: user.userId,
    name: user.userName || user.userEmail,
    email: user.userEmail,
    avatar: null, // You can add avatar URLs if available
    department: 'Security', // You can pull this from user metadata
    totalPoints: Number(user.totalPoints),
    exercisesCompleted: Number(user.exercisesCompleted),
    averageScore: Number(user.averageScore) || 0,
    monthlyPoints: Number(user.monthlyPoints),
    monthlyExercises: Number(user.monthlyExercises),
    weeklyPoints: Number(user.weeklyPoints),
    weeklyExercises: Number(user.weeklyExercises),
    rank: index + 1,
    trend: 'stable' as 'up' | 'down' | 'stable' // Simplified
  }));
}

export async function getTeamStats() {
  // Get active members count (users who completed at least one exercise this month)
  const activeMembers = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${exerciseCompletions.userId})`
    })
    .from(exerciseCompletions)
    .where(and(
      isNotNull(exerciseCompletions.completedAt),
      gte(exerciseCompletions.completedAt, sql`CURRENT_DATE - INTERVAL '30 days'`)
    ));

  // Get team average score
  const teamAverage = await db
    .select({
      avgScore: sql<number>`AVG(${exerciseCompletions.score}::float / ${exerciseCompletions.totalScore} * 100)`
    })
    .from(exerciseCompletions)
    .where(isNotNull(exerciseCompletions.completedAt));

  // Get total exercises completed by team
  const totalExercises = await db
    .select({
      count: sql<number>`COUNT(*)`
    })
    .from(exerciseCompletions)
    .where(isNotNull(exerciseCompletions.completedAt));

  // Calculate current streak (days with at least one exercise completed)
  const streakData = await db
    .select({
      date: sql<string>`DATE(${exerciseCompletions.completedAt})`.as('date')
    })
    .from(exerciseCompletions)
    .where(isNotNull(exerciseCompletions.completedAt))
    .groupBy(sql`DATE(${exerciseCompletions.completedAt})`)
    .orderBy(desc(sql`DATE(${exerciseCompletions.completedAt})`))
    .limit(30);

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < streakData.length; i++) {
    const exerciseDate = new Date(streakData[i].date);
    exerciseDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - exerciseDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === i) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Get achievement holders (simplified)
  const perfectScorer = await db
    .select({
      userId: exerciseCompletions.userId,
      userName: users.name,
      count: sql<number>`COUNT(*)`.as('perfect_count')
    })
    .from(exerciseCompletions)
    .innerJoin(users, eq(users.id, exerciseCompletions.userId))
    .where(and(
      isNotNull(exerciseCompletions.completedAt),
      sql`${exerciseCompletions.score} = ${exerciseCompletions.totalScore}`
    ))
    .groupBy(exerciseCompletions.userId, users.name)
    .orderBy(desc(sql`perfect_count`))
    .limit(1);

  const speedRunner = await db
    .select({
      userId: exerciseCompletions.userId,
      userName: users.name,
      avgTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${exerciseCompletions.completedAt} - ${exerciseCompletions.startedAt})) / 60)`.as('avg_time')
    })
    .from(exerciseCompletions)
    .innerJoin(users, eq(users.id, exerciseCompletions.userId))
    .where(isNotNull(exerciseCompletions.completedAt))
    .groupBy(exerciseCompletions.userId, users.name)
    .orderBy(sql`avg_time`)
    .limit(1);

  const mostDedicated = await db
    .select({
      userId: exerciseCompletions.userId,
      userName: users.name,
      totalExercises: sql<number>`COUNT(*)`.as('total_exercises')
    })
    .from(exerciseCompletions)
    .innerJoin(users, eq(users.id, exerciseCompletions.userId))
    .where(isNotNull(exerciseCompletions.completedAt))
    .groupBy(exerciseCompletions.userId, users.name)
    .orderBy(desc(sql`total_exercises`))
    .limit(1);

  return {
    activeMembersCount: Number(activeMembers[0]?.count || 0),
    averageScore: Number(teamAverage[0]?.avgScore || 0),
    totalExercisesCompleted: Number(totalExercises[0]?.count || 0),
    currentStreak,
    achievements: {
      perfectScorer: perfectScorer[0] ? {
        name: perfectScorer[0].userName || 'Unknown',
        count: Number(perfectScorer[0].count)
      } : null,
      speedRunner: speedRunner[0] ? {
        name: speedRunner[0].userName || 'Unknown',
        time: Math.round(Number(speedRunner[0].avgTime))
      } : null,
      mostDedicated: mostDedicated[0] ? {
        name: mostDedicated[0].userName || 'Unknown',
        streak: currentStreak // Simplified - you'd track individual streaks
      } : null
    }
  };
}