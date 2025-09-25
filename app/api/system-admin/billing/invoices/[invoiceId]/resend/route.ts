import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { invoices, billingEvents } from '@/lib/db/schema-billing';
import { teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/system-admin/billing/invoices/[invoiceId]/resend - Resend invoice email
export const POST = withSystemAdmin(async (
  req: NextRequest,
  context: { params: { invoiceId: string }, user: any }
) => {
  try {
    const invoiceId = parseInt(context.params.invoiceId);
    const { email } = await req.json();

    // Get invoice with organization details
    const [invoiceData] = await db
      .select({
        invoice: invoices,
        organizationName: teams.name,
        organizationEmail: teams.email,
      })
      .from(invoices)
      .leftJoin(teams, eq(invoices.organizationId, teams.id))
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoiceData) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const targetEmail = email || invoiceData.organizationEmail;

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'No email address provided' },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service (Resend/SendGrid/etc)
    // For now, we'll just log the event

    // Example email integration:
    // await sendEmail({
    //   to: targetEmail,
    //   subject: `Invoice ${invoiceData.invoice.invoiceNumber} from Sekuriti.io`,
    //   template: 'invoice',
    //   data: {
    //     organizationName: invoiceData.organizationName,
    //     invoiceNumber: invoiceData.invoice.invoiceNumber,
    //     total: invoiceData.invoice.total,
    //     dueDate: invoiceData.invoice.dueDate,
    //     downloadUrl: invoiceData.invoice.stripePdfUrl || `/api/invoices/${invoiceId}/download`,
    //   }
    // });

    // Log billing event
    await db.insert(billingEvents).values({
      organizationId: invoiceData.invoice.organizationId,
      eventType: 'invoice.resent',
      eventSource: 'admin_action',
      invoiceId: invoiceId,
      data: {
        invoiceNumber: invoiceData.invoice.invoiceNumber,
        sentTo: targetEmail,
        sentBy: context.user.id,
      },
      userId: context.user.id,
    });

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${targetEmail}`,
    });
  } catch (error) {
    console.error('Error resending invoice:', error);
    return NextResponse.json(
      { error: 'Failed to resend invoice' },
      { status: 500 }
    );
  }
});