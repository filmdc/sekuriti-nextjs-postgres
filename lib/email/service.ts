import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const fromEmail = from || process.env.EMAIL_FROM || 'security@sekuriti.io';
    const fromName = process.env.EMAIL_FROM_NAME || 'Sekuriti Security';

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getVerificationEmailTemplate(code: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Security Verification</h1>
        </div>

        <div style="padding: 40px 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${userName ? `Hi ${userName},` : 'Hi there,'}
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            You've requested to sign in to your Sekuriti account. Please use the verification code below to complete your login:
          </p>

          <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
              Your Verification Code
            </p>
            <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">
              ${code}
            </p>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
            This code will expire in <strong>5 minutes</strong> for your security.
          </p>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and ensure your account is secure.
            </p>
          </div>

          <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            This is an automated message from Sekuriti. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPasswordResetEmailTemplate(resetLink: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>

        <div style="padding: 40px 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${userName ? `Hi ${userName},` : 'Hi there,'}
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password for your Sekuriti account. Click the button below to create a new password:
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
              Reset Password
            </a>
          </div>

          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
            Or copy and paste this link into your browser:
          </p>

          <p style="color: #666; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 4px;">
            ${resetLink}
          </p>

          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
            This link will expire in <strong>1 hour</strong> for your security.
          </p>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>

          <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            This is an automated message from Sekuriti. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getIncidentNotificationEmailTemplate(
  incidentTitle: string,
  incidentReference: string,
  severity: string,
  assignedTo?: string
): string {
  const severityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545'
  };

  const severityColor = severityColors[severity as keyof typeof severityColors] || '#6c757d';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Security Incident</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🚨 Security Incident Alert</h1>
        </div>

        <div style="padding: 40px 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${assignedTo ? `Hi ${assignedTo},` : 'Team,'}
          </p>

          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            A new security incident has been reported and requires immediate attention:
          </p>

          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
              <strong>Incident Reference:</strong> ${incidentReference}
            </p>
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
              <strong>Title:</strong> ${incidentTitle}
            </p>
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Severity:</strong>
              <span style="display: inline-block; padding: 4px 12px; background-color: ${severityColor}; color: white; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                ${severity}
              </span>
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.BASE_URL}/incidents/${incidentReference}" style="display: inline-block; padding: 14px 32px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
              View Incident Details
            </a>
          </div>

          <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            This is an automated alert from Sekuriti Incident Response System.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}