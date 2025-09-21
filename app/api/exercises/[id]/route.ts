import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getExerciseById } from '@/lib/db/queries-exercises';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exerciseId = parseInt(params.id);
    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: 'Invalid exercise ID' }, { status: 400 });
    }

    const exercise = await getExerciseById(exerciseId);

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise' },
      { status: 500 }
    );
  }
}