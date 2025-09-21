import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { uploadExecutionEvidence } from '@/app/actions/runbooks';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; executionId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const stepId = formData.get('stepId') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!stepId) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    // In a real implementation, you would upload the file to cloud storage
    // For now, we'll simulate this with a mock URL
    const fileUrl = `https://example.com/evidence/${file.name}`;

    const evidence = await uploadExecutionEvidence(
      params.executionId,
      stepId,
      {
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        fileType: file.type,
        description,
      }
    );

    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Evidence upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload evidence' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; executionId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const stepId = searchParams.get('stepId');

    if (!stepId) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    // This would typically fetch from the database
    // For now, return a mock response
    const evidence = [];

    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Evidence fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}