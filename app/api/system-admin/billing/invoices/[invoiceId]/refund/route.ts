import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { invoices, billingEvents } from '@/lib/db/schema-billing';
import { eq } from 'drizzle-orm';

// POST /api/system-admin/billing/invoices/[invoiceId]/refund - Refund an invoice
export const POST = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { invoiceId: string }, user: any }
) => {
  try {
    const invoiceId = parseInt(context.params.invoiceId);
    const { amount, reason } = await req.json();

    // Check invoice exists and can be refunded
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

    if (invoice.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Only paid invoices can be refunded' },
        { status: 400 }
      );
    }

    const refundAmount = amount || parseFloat(invoice.total);
    const isPartialRefund = amount && amount < parseFloat(invoice.total);

    // Update invoice status
    const [refundedInvoice] = await db
      .update(invoices)
      .set({
        status: isPartialRefund ? 'partially_refunded' : 'refunded',
        metadata: {
          ...invoice.metadata,
          refunds: [
            ...(invoice.metadata?.refunds || []),
            {
              amount: refundAmount,
              reason,
              refundedBy: context.user.id,
              refundedAt: new Date(),
            }
          ]
        },
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    // Log billing event
    await db.insert(billingEvents).values({
      organizationId: invoice.organizationId,
      eventType: isPartialRefund ? 'invoice.partially_refunded' : 'invoice.refunded',
      eventSource: 'admin_action',
      invoiceId: invoiceId,
      data: {
        invoiceNumber: invoice.invoiceNumber,
        amount: refundAmount,
        reason,
        refundedBy: context.user.id,
      },
      userId: context.user.id,
    });

    // TODO: Integrate with Stripe to process actual refund
    // if (invoice.stripePaymentIntentId) {
    //   await stripe.refunds.create({
    //     payment_intent: invoice.stripePaymentIntentId,
    //     amount: Math.round(refundAmount * 100), // Convert to cents
    //   });
    // }

    return NextResponse.json({
      success: true,
      invoice: refundedInvoice,
      refundAmount,
    });
  } catch (error) {
    console.error('Error refunding invoice:', error);
    return NextResponse.json(
      { error: 'Failed to refund invoice' },
      { status: 500 }
    );
  }
});