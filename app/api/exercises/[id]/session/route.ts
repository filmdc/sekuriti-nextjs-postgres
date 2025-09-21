import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { exerciseCompletions } from '@/lib/db/schema-ir';
import { eq, and, isNull } from 'drizzle-orm';
import { startExercise } from '@/lib/db/queries-exercises';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exerciseId = parseInt(params.id);
    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: 'Invalid exercise ID' }, { status: 400 });
    }

    // Check for existing session
    const existingSession = await db
      .select()
      .from(exerciseCompletions)
      .where(and(
        eq(exerciseCompletions.userId, parseInt(session.user.id)),
        eq(exerciseCompletions.exerciseId, exerciseId),
        isNull(exerciseCompletions.completedAt)
      ))
      .limit(1);

    if (existingSession.length > 0) {
      // Parse metadata for session info
      const metadata = existingSession[0].feedback ?
        JSON.parse(existingSession[0].feedback) : {};

      return NextResponse.json({
        id: existingSession[0].id,
        exerciseId: existingSession[0].exerciseId,
        answers: existingSession[0].answers || {},
        currentQuestion: metadata.currentQuestion || 0,
        timeRemaining: metadata.timeRemaining || null,
        startedAt: existingSession[0].startedAt
      });
    }

    // Create new session
    const newSession = await startExercise(parseInt(session.user.id), exerciseId);

    return NextResponse.json({
      id: newSession.id,
      exerciseId: newSession.exerciseId,
      answers: {},
      currentQuestion: 0,
      timeRemaining: null, // Will be set based on exercise duration
      startedAt: newSession.startedAt
    });
  } catch (error) {
    console.error('Error managing exercise session:', error);
    return NextResponse.json(
      { error: 'Failed to manage exercise session' },
      { status: 500 }
    );
  }
}