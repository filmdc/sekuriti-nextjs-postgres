import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { incidents } from '@/lib/db/schema-ir';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [incident] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, parseInt(params.id)))
      .limit(1);

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const [updatedIncident] = await db
      .update(incidents)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(incidents.id, parseInt(params.id)))
      .returning();

    if (!updatedIncident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [deletedIncident] = await db
      .delete(incidents)
      .where(eq(incidents.id, parseInt(params.id)))
      .returning();

    if (!deletedIncident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: deletedIncident.id });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { error: 'Failed to delete incident' },
      { status: 500 }
    );
  }
}