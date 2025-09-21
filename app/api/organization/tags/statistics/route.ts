import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getTagStatistics } from '@/lib/db/queries-tags';

// GET /api/organization/tags/statistics - Get tag usage statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statistics = await getTagStatistics(user.teamId);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching tag statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}