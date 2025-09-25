import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams } from '@/lib/db/schema';
import { invoices, subscriptions, paymentMethods, billingEvents } from '@/lib/db/schema-billing';
import { sql, eq, and, gte, desc, lte, or, like, ne } from 'drizzle-orm';

// GET /api/system-admin/billing/invoices - List all invoices with filters
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    // Status filter
    if (status !== 'all') {
      if (status === 'overdue') {
        // Overdue means pending and past due date
        conditions.push(
          and(
            eq(invoices.status, 'pending'),
            lte(invoices.dueDate, new Date())
          )
        );
      } else {
        conditions.push(eq(invoices.status, status as any));
      }
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(invoices.invoiceNumber, `%${search}%`),
          like(invoices.stripeInvoiceId, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get invoices with organization names
    const invoicesRaw = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        organizationId: invoices.organizationId,
        organizationName: teams.name,
        subscriptionId: invoices.subscriptionId,
        status: invoices.status,
        subtotal: invoices.subtotal,
        tax: invoices.tax,
        discount: invoices.discount,
        total: invoices.total,
        currency: invoices.currency,
        issuedAt: invoices.issuedAt,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        voidedAt: invoices.voidedAt,
        lineItems: invoices.lineItems,
        stripeInvoiceId: invoices.stripeInvoiceId,
        stripePdfUrl: invoices.stripePdfUrl,
        metadata: invoices.metadata,
      })
      .from(invoices)
      .leftJoin(teams, eq(invoices.organizationId, teams.id))
      .where(whereClause)
      .orderBy(desc(invoices.issuedAt))
      .limit(limit)
      .offset(offset);

    // Convert dates to ISO strings for JSON serialization
    const invoicesList = invoicesRaw.map(invoice => ({
      ...invoice,
      issuedAt: invoice.issuedAt?.toISOString() || null,
      dueDate: invoice.dueDate?.toISOString() || null,
      paidAt: invoice.paidAt?.toISOString() || null,
      voidedAt: invoice.voidedAt?.toISOString() || null,
    }));

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(invoices)
      .where(whereClause);

    const totalCount = countResult?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Calculate statistics
    const now = new Date();
    const [stats] = await db
      .select({
        totalRevenue: sql<number>`CAST(COALESCE(SUM(CASE WHEN status = 'succeeded' THEN total END), 0) AS DECIMAL(10,2))`,
        pendingAmount: sql<number>`CAST(COALESCE(SUM(CASE WHEN status = 'pending' THEN total END), 0) AS DECIMAL(10,2))`,
        overdueCount: sql<number>`CAST(COUNT(CASE WHEN status = 'pending' AND due_date < ${now} THEN 1 END) AS INTEGER)`,
        averageInvoiceValue: sql<number>`CAST(COALESCE(AVG(total), 0) AS DECIMAL(10,2))`,
      })
      .from(invoices);

    return NextResponse.json({
      invoices: invoicesList,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
      },
      stats: {
        totalRevenue: parseFloat(stats?.totalRevenue || '0'),
        pendingAmount: parseFloat(stats?.pendingAmount || '0'),
        overdueCount: stats?.overdueCount || 0,
        averageInvoiceValue: parseFloat(stats?.averageInvoiceValue || '0'),
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
});

// POST /api/system-admin/billing/invoices - Manually create an invoice
export const POST = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    const body = await req.json();
    const {
      organizationId,
      subscriptionId,
      lineItems,
      dueDate,
      notes,
    } = body;

    // Validate organization exists
    const [organization] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, organizationId))
      .limit(1);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Calculate totals from line items
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax rate (configurable)
    const total = subtotal + tax;

    // Generate invoice number
    const now = new Date();
    const invoiceNumber = `INV-${organizationId}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    // Create the invoice
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        organizationId,
        subscriptionId,
        invoiceNumber,
        status: 'pending',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        discount: '0',
        total: total.toFixed(2),
        currency: 'USD',
        issuedAt: now,
        dueDate: dueDate ? new Date(dueDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        lineItems,
        metadata: { notes, createdBy: context.user.id },
      })
      .returning();

    // Log billing event
    await db.insert(billingEvents).values({
      organizationId,
      eventType: 'invoice.created',
      eventSource: 'admin_action',
      invoiceId: newInvoice.id,
      data: { invoiceNumber, total, createdBy: context.user.id },
      userId: context.user.id,
    });

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
});