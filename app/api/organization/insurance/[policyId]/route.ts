import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers } from '@/lib/db/schema';
import { insurancePolicies } from '@/lib/db/schema-ir';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function PUT(
  request: NextRequest,
  { params }: { params: { policyId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policyId = parseInt(params.policyId);
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

    // Update insurance policy
    const [updatedPolicy] = await db
      .update(insurancePolicies)
      .set({
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
        additionalNotes: body.additionalNotes,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(insurancePolicies.id, policyId),
          eq(insurancePolicies.organizationId, organizationId)
        )
      )
      .returning();

    if (!updatedPolicy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating insurance policy:', error);
    return NextResponse.json(
      { error: 'Failed to update insurance policy' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { policyId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policyId = parseInt(params.policyId);

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

    // Delete insurance policy
    await db
      .delete(insurancePolicies)
      .where(
        and(
          eq(insurancePolicies.id, policyId),
          eq(insurancePolicies.organizationId, organizationId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insurance policy:', error);
    return NextResponse.json(
      { error: 'Failed to delete insurance policy' },
      { status: 500 }
    );
  }
}