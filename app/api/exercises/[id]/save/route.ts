import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveExerciseProgress } from '@/lib/db/queries-exercises';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, answers, currentQuestion, timeRemaining } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    await saveExerciseProgress(
      sessionId,
      answers || {},
      currentQuestion,
      timeRemaining
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving exercise progress:', error);
    return NextResponse.json(
      { error: 'Failed to save exercise progress' },
      { status: 500 }
    );
  }
}