import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { insurancePolicies } from '@/lib/db/schema-ir';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const memberRecord = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organizationId = memberRecord[0].teamId;

    // Fetch insurance policies
    const policies = await db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.organizationId, organizationId));

    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance policies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Get user's organization and verify they have permission
    const memberRecord = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const organizationId = memberRecord[0].teamId;
    const userRole = memberRecord[0].role;

    // Check if user has permission (admin or owner)
    if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create insurance policy
    const [newPolicy] = await db
      .insert(insurancePolicies)
      .values({
        organizationId,
        provider: body.provider,
        policyNumber: body.policyNumber,
        coverageType: body.coverageType,
        coverageAmount: body.coverageAmount,
        deductible: body.deductible,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        claimsContact: body.claimsContact,
        claimsPhone: body.claimsPhone,
        claimsEmail: body.claimsEmail,
        additionalNotes: body.additionalNotes
      })
      .returning();

    return NextResponse.json(newPolicy);
  } catch (error) {
    console.error('Error creating insurance policy:', error);
    return NextResponse.json(
      { error: 'Failed to create insurance policy' },
      { status: 500 }
    );
  }
}