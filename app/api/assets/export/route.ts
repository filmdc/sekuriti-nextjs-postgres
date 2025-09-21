import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { exportAssets } from '@/lib/db/queries-assets';

// GET /api/assets/export - Export assets
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') as 'csv' | 'json' || 'csv';

    const data = await exportAssets(user.teamId, format);

    if (format === 'csv') {
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="assets-export-${new Date().toISOString()}.csv"`
        }
      });
    } else {
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="assets-export-${new Date().toISOString()}.json"`
        }
      });
    }
  } catch (error) {
    console.error('Error exporting assets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}