import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { communicationTemplates, incidents } from '@/lib/db/schema-ir';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs';

interface SendCommunicationRequest {
  templateId: number;
  incidentId?: number;
  method: 'email' | 'sms' | 'manual';
  recipients: string[];
  subject: string;
  content: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SendCommunicationRequest = await request.json();
    const { templateId, incidentId, method, recipients, subject, content, notes } = body;

    // Validate required fields
    if (!templateId || !method || !recipients.length || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify template exists
    const [template] = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.id, templateId))
      .limit(1);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Verify incident exists if provided
    if (incidentId) {
      const [incident] = await db
        .select()
        .from(incidents)
        .where(
          and(
            eq(incidents.id, incidentId),
            eq(incidents.organizationId, parseInt(orgId || '0'))
          )
        )
        .limit(1);

      if (!incident) {
        return NextResponse.json(
          { error: 'Incident not found' },
          { status: 404 }
        );
      }
    }

    // Process communication based on method
    let result;
    switch (method) {
      case 'email':
        result = await sendEmailCommunication(recipients, subject, content);
        break;
      case 'sms':
        result = await sendSMSCommunication(recipients, content);
        break;
      case 'manual':
        result = { success: true, message: 'Manual communication logged' };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid communication method' },
          { status: 400 }
        );
    }

    // Log the communication
    const communicationLog = {
      templateId,
      incidentId,
      method,
      recipients,
      subject,
      content,
      notes,
      sentBy: parseInt(userId),
      sentAt: new Date(),
      status: result.success ? 'sent' : 'failed',
      error: result.error,
    };

    // TODO: Store in communication_logs table
    console.log('Communication log:', communicationLog);

    // Update template usage stats
    // TODO: Implement usage tracking

    if (result.success) {
      return NextResponse.json({
        message: 'Communication sent successfully',
        details: result,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send communication', details: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending communication:', error);
    return NextResponse.json(
      { error: 'Failed to send communication' },
      { status: 500 }
    );
  }
}

async function sendEmailCommunication(
  recipients: string[],
  subject: string,
  content: string
) {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  // For now, simulate email sending
  console.log('Sending email to:', recipients);
  console.log('Subject:', subject);
  console.log('Content:', content);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate success/failure
  const success = Math.random() > 0.1; // 90% success rate
  return {
    success,
    messageId: success ? `msg_${Date.now()}` : undefined,
    error: success ? undefined : 'Email service temporarily unavailable',
  };
}

async function sendSMSCommunication(recipients: string[], content: string) {
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  // For now, simulate SMS sending
  console.log('Sending SMS to:', recipients);
  console.log('Content:', content);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate success/failure
  const success = Math.random() > 0.15; // 85% success rate
  return {
    success,
    messageId: success ? `sms_${Date.now()}` : undefined,
    error: success ? undefined : 'SMS service temporarily unavailable',
  };
}