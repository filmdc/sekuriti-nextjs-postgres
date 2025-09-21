import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { createIncident } from '@/lib/db/queries-ir';
import { db } from '@/lib/db/drizzle';
import { activityLogs, ActivityType } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, classification, severity, detectionDetails } = body;

    if (!title || !classification || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the incident
    const incident = await createIncident({
      organizationId: team.id,
      title,
      description,
      classification,
      severity,
      reportedBy: user.id,
      assignedTo: user.id, // Auto-assign to reporter initially
    });

    // Update the incident with detection details if provided
    if (detectionDetails) {
      await db
        .update(incidents)
        .set({ detectionDetails })
        .where(eq(incidents.id, incident.id));
    }

    // Log the activity
    await db.insert(activityLogs).values({
      teamId: team.id,
      userId: user.id,
      action: ActivityType.CREATE_INCIDENT,
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { incidents } from '@/lib/db/schema-ir';
import { eq } from 'drizzle-orm';