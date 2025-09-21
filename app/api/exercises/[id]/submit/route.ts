import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/next-auth';
import { submitExercise } from '@/lib/db/queries-exercises';

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
    const { sessionId, answers } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const result = await submitExercise(sessionId, answers || {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting exercise:', error);
    return NextResponse.json(
      { error: 'Failed to submit exercise' },
      { status: 500 }
    );
  }
}