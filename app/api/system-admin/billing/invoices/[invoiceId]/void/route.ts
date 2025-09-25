import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { invoices, billingEvents } from '@/lib/db/schema-billing';
import { eq } from 'drizzle-orm';

// POST /api/system-admin/billing/invoices/[invoiceId]/void - Void an invoice
export const POST = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { invoiceId: string }, user: any }
) => {
  try {
    const invoiceId = parseInt(context.params.invoiceId);
    const { reason } = await req.json();

    // Check invoice exists and can be voided
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending invoices can be voided' },
        { status: 400 }
      );
    }

    // Update invoice status to voided
    const [voidedInvoice] = await db
      .update(invoices)
      .set({
        status: 'failed',
        voidedAt: new Date(),
        metadata: {
          ...invoice.metadata,
          voidReason: reason,
          voidedBy: context.user.id,
        },
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    // Log billing event
    await db.insert(billingEvents).values({
      organizationId: invoice.organizationId,
      eventType: 'invoice.voided',
      eventSource: 'admin_action',
      invoiceId: invoiceId,
      data: {
        invoiceNumber: invoice.invoiceNumber,
        reason,
        voidedBy: context.user.id,
      },
      userId: context.user.id,
    });

    return NextResponse.json({
      success: true,
      invoice: voidedInvoice,
    });
  } catch (error) {
    console.error('Error voiding invoice:', error);
    return NextResponse.json(
      { error: 'Failed to void invoice' },
      { status: 500 }
    );
  }
});