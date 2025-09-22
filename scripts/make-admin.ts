import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function makeAdmin(email: string) {
  const result = await db
    .update(users)
    .set({ isSystemAdmin: true })
    .where(eq(users.email, email))
    .returning();

  if (result.length > 0) {
    console.log(`✅ User ${email} is now a system admin`);
  } else {
    console.log(`❌ User ${email} not found`);
  }
  process.exit(0);
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: pnpm tsx scripts/make-admin.ts <email>');
  process.exit(1);
}

makeAdmin(email).catch(console.error);