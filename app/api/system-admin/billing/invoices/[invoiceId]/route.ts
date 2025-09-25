import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { invoices, billingEvents } from '@/lib/db/schema-billing';
import { teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/system-admin/billing/invoices/[invoiceId] - Get single invoice details
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { invoiceId: string }, user: any }
) => {
  try {
    const invoiceId = parseInt(context.params.invoiceId);

    const [invoice] = await db
      .select({
        invoice: invoices,
        organizationName: teams.name,
        organizationEmail: teams.email,
      })
      .from(invoices)
      .leftJoin(teams, eq(invoices.organizationId, teams.id))
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...invoice.invoice,
      organizationName: invoice.organizationName,
      organizationEmail: invoice.organizationEmail,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
});

// PATCH /api/system-admin/billing/invoices/[invoiceId] - Update invoice
export const PATCH = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { invoiceId: string }, user: any }
) => {
  try {
    const invoiceId = parseInt(context.params.invoiceId);
    const updates = await req.json();

    // Check invoice exists
    const [existingInvoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update invoice
    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    // Log billing event
    await db.insert(billingEvents).values({
      organizationId: existingInvoice.organizationId,
      eventType: 'invoice.updated',
      eventSource: 'admin_action',
      invoiceId: invoiceId,
      data: { updates, updatedBy: context.user.id },
      userId: context.user.id,
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
});

// DELETE /api/system-admin/billing/invoices/[invoiceId] - Delete draft invoice
export const DELETE = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { invoiceId: string }, user: any }
) => {
  try {
    const invoiceId = parseInt(context.params.invoiceId);

    // Check invoice exists and is deletable
    const [existingInvoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of pending invoices that haven't been sent
    if (existingInvoice.status !== 'pending' || existingInvoice.stripeInvoiceId) {
      return NextResponse.json(
        { error: 'Cannot delete this invoice' },
        { status: 400 }
      );
    }

    // Delete invoice
    await db
      .delete(invoices)
      .where(eq(invoices.id, invoiceId));

    // Log billing event
    await db.insert(billingEvents).values({
      organizationId: existingInvoice.organizationId,
      eventType: 'invoice.deleted',
      eventSource: 'admin_action',
      data: {
        invoiceNumber: existingInvoice.invoiceNumber,
        deletedBy: context.user.id,
      },
      userId: context.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
});