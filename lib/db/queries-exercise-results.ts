import { db } from '@/lib/db/drizzle';
import {
  tabletopExercises,
  exerciseQuestions,
  exerciseCompletions
} from './schema-ir';
import { eq, and, sql, desc } from 'drizzle-orm';

export async function getExerciseResults(userId: number, exerciseId: number) {
  // Get the most recent completion
  const completions = await db
    .select()
    .from(exerciseCompletions)
    .where(and(
      eq(exerciseCompletions.userId, userId),
      eq(exerciseCompletions.exerciseId, exerciseId),
      sql`${exerciseCompletions.completedAt} IS NOT NULL`
    ))
    .orderBy(desc(exerciseCompletions.completedAt))
    .limit(1);

  if (completions.length === 0) {
    return null;
  }

  const completion = completions[0];

  // Get exercise details
  const [exercise] = await db
    .select()
    .from(tabletopExercises)
    .where(eq(tabletopExercises.id, exerciseId));

  // Get questions
  const questions = await db
    .select()
    .from(exerciseQuestions)
    .where(eq(exerciseQuestions.exerciseId, exerciseId))
    .orderBy(exerciseQuestions.questionNumber);

  // Calculate category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(
    questions,
    completion.answers as Record<number, string>
  );

  // Count correct answers
  const answers = completion.answers as Record<number, string> || {};
  let correctAnswers = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correctAnswer) {
      correctAnswers++;
    }
  });

  // Get recommendations
  const recommendations = await getRecommendations(userId, exerciseId, completion.score / completion.totalScore);

  return {
    ...completion,
    exercise,
    questions,
    correctAnswers,
    totalQuestions: questions.length,
    categoryBreakdown,
    recommendations,
    answers
  };
}

function calculateCategoryBreakdown(
  questions: any[],
  answers: Record<number, string>
) {
  // Group questions by category (you might want to add a category field to questions)
  // For now, we'll use a simple difficulty-based breakdown
  const breakdown: Record<string, { correct: number; total: number }> = {};

  questions.forEach(q => {
    const category = 'General'; // You can enhance this with actual categories
    if (!breakdown[category]) {
      breakdown[category] = { correct: 0, total: 0 };
    }
    breakdown[category].total++;
    if (answers[q.id] === q.correctAnswer) {
      breakdown[category].correct++;
    }
  });

  return Object.entries(breakdown).map(([name, stats]) => ({
    name,
    correct: stats.correct,
    total: stats.total
  }));
}

async function getRecommendations(userId: number, exerciseId: number, scorePercentage: number) {
  const [exercise] = await db
    .select()
    .from(tabletopExercises)
    .where(eq(tabletopExercises.id, exerciseId));

  if (!exercise) return [];

  // Get similar exercises based on category and difficulty
  let query = db
    .select()
    .from(tabletopExercises)
    .where(and(
      eq(tabletopExercises.isActive, true),
      sql`${tabletopExercises.id} != ${exerciseId}`
    ));

  // If user scored low, recommend same or easier difficulty
  if (scorePercentage < 0.7) {
    query = query.where(sql`
      CASE ${tabletopExercises.difficulty}
        WHEN 'beginner' THEN 0
        WHEN 'intermediate' THEN 1
        WHEN 'advanced' THEN 2
      END <= CASE ${exercise.difficulty}
        WHEN 'beginner' THEN 0
        WHEN 'intermediate' THEN 1
        WHEN 'advanced' THEN 2
      END
    `);
  } else {
    // If scored well, recommend same or harder difficulty
    query = query.where(sql`
      CASE ${tabletopExercises.difficulty}
        WHEN 'beginner' THEN 0
        WHEN 'intermediate' THEN 1
        WHEN 'advanced' THEN 2
      END >= CASE ${exercise.difficulty}
        WHEN 'beginner' THEN 0
        WHEN 'intermediate' THEN 1
        WHEN 'advanced' THEN 2
      END
    `);
  }

  // Prioritize same category
  if (exercise.category) {
    query = query.orderBy(sql`
      CASE WHEN ${tabletopExercises.category} = ${exercise.category} THEN 0 ELSE 1 END
    `);
  }

  return query.limit(3);
}