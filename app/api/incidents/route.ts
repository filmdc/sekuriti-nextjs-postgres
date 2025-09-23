import { NextRequest, NextResponse } from 'next/server';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { createIncident } from '@/lib/db/queries-ir';
import { db } from '@/lib/db/drizzle';
import { activityLogs, ActivityType } from '@/lib/db/schema';
import { enforceQuota, updateResourceCount } from '@/lib/middleware/quota-enforcement';
import { QuotaExceededError } from '@/lib/types/api-responses';

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

    // Check quota before creating incident
    try {
      await enforceQuota(team.id, 'incidents', 1);
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        return NextResponse.json(
          {
            error: error.message,
            quotaExceeded: true,
            resourceType: error.resourceType,
            current: error.current,
            limit: error.limit,
            upgradeUrl: error.upgradeUrl
          },
          { status: 402 }
        );
      }
      throw error;
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

    // Update incident count (this is handled automatically by quota enforcement)
    // but we could add explicit counter updates here if needed

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