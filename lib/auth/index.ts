import { getSession } from './session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function auth() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Get user from database
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user || user.length === 0) {
    return null;
  }

  return {
    user: {
      id: user[0].id.toString(),
      email: user[0].email,
      name: user[0].name,
      teamId: user[0].teamId,
    },
    expires: session.expires,
  };
}