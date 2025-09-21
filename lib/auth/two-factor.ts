import { db } from '@/lib/db/drizzle';
import { twoFactorCodes } from '@/lib/db/schema-ir';
import { eq, and, gte } from 'drizzle-orm';
import { generateVerificationCode, sendEmail, getVerificationEmailTemplate } from '@/lib/email/service';

export async function createAndSend2FACode(userId: number, userEmail: string, userName?: string) {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + (parseInt(process.env['2FA_CODE_EXPIRY'] || '300') * 1000)); // 5 minutes by default

  // Store the code in database
  await db.insert(twoFactorCodes).values({
    userId,
    code,
    expiresAt,
  });

  // Send email
  const emailHtml = getVerificationEmailTemplate(code, userName);
  await sendEmail({
    to: userEmail,
    subject: 'Your Sekuriti Verification Code',
    html: emailHtml,
  });

  return { success: true };
}

export async function verify2FACode(userId: number, code: string) {
  const validCode = await db
    .select()
    .from(twoFactorCodes)
    .where(
      and(
        eq(twoFactorCodes.userId, userId),
        eq(twoFactorCodes.code, code),
        gte(twoFactorCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  if (validCode.length === 0) {
    return { success: false, error: 'Invalid or expired code' };
  }

  // Mark the code as used
  await db
    .update(twoFactorCodes)
    .set({ usedAt: new Date() })
    .where(eq(twoFactorCodes.id, validCode[0].id));

  // Clean up old codes for this user
  await cleanupOldCodes(userId);

  return { success: true };
}

async function cleanupOldCodes(userId: number) {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  await db
    .delete(twoFactorCodes)
    .where(
      and(
        eq(twoFactorCodes.userId, userId),
        gte(cutoffDate, twoFactorCodes.createdAt)
      )
    );
}