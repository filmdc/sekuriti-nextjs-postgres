// Script to create a system admin user for testing
// Run with: npx tsx lib/db/seed-system-admin.ts

import { config } from 'dotenv';
import { db } from './drizzle';
import { users } from './schema';
import { hashPassword } from '../auth/session';
import { eq } from 'drizzle-orm';

config();

async function seedSystemAdmin() {
  console.log('🔐 Creating system admin user...');

  const email = 'admin@sekuriti.io';
  const password = 'SystemAdmin123!';

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingAdmin.length > 0) {
      // Update existing user to be system admin
      await db
        .update(users)
        .set({
          isSystemAdmin: true,
          role: 'owner',
        })
        .where(eq(users.email, email));

      console.log(`✅ Updated existing user ${email} as system admin`);
    } else {
      // Create new system admin user
      const passwordHash = await hashPassword(password);

      const [newAdmin] = await db
        .insert(users)
        .values({
          email,
          name: 'System Administrator',
          passwordHash,
          role: 'owner',
          isSystemAdmin: true,
          isOrganizationAdmin: true,
        })
        .returning();

      console.log(`✅ Created system admin user: ${email}`);
    }

    console.log('\n📝 System Admin Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Portal: http://localhost:3000/system-admin/dashboard`);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating system admin:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedSystemAdmin();