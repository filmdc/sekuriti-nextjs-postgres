import { db } from './drizzle';
import { users, teams, teamMembers, activityLogs, ActivityType } from './schema';
import { incidents, assets } from './schema-ir';
import { tags } from './schema-tags';
import { hashPassword } from '../auth/session';
import { eq } from 'drizzle-orm';

export async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  try {
    // Create system admin user if not exists
    const adminEmail = 'admin@sekuriti.io';
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    let adminUser;
    if (existingAdmin.length === 0) {
      const passwordHash = await hashPassword('admin123');
      [adminUser] = await db
        .insert(users)
        .values({
          name: 'System Admin',
          email: adminEmail,
          passwordHash,
          role: 'owner',
          isSystemAdmin: true,
          isOrganizationAdmin: true,
        })
        .returning();
      console.log('✅ Created system admin user');
    } else {
      adminUser = existingAdmin[0];
      console.log('ℹ️ System admin user already exists');
    }

    // Create demo organizations
    const demoOrgs = [
      {
        name: 'Acme Corporation',
        industry: 'Technology',
        size: 'large',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        phone: '+1 (555) 123-4567',
        website: 'https://acme.com',
        status: 'active',
        licenseCount: 25,
        planName: 'professional',
        subscriptionStatus: 'active',
      },
      {
        name: 'Global Industries Inc',
        industry: 'Manufacturing',
        size: 'enterprise',
        address: '456 Industrial Blvd, Detroit, MI 48000',
        phone: '+1 (555) 987-6543',
        website: 'https://globalind.com',
        status: 'active',
        licenseCount: 100,
        planName: 'enterprise',
        subscriptionStatus: 'active',
      },
    ];

    const createdOrgs = [];
    for (const orgData of demoOrgs) {
      const existingOrg = await db
        .select()
        .from(teams)
        .where(eq(teams.name, orgData.name))
        .limit(1);

      if (existingOrg.length === 0) {
        const [org] = await db.insert(teams).values(orgData).returning();
        createdOrgs.push(org);
        console.log(`✅ Created organization: ${org.name}`);
      } else {
        createdOrgs.push(existingOrg[0]);
        console.log(`ℹ️ Organization already exists: ${orgData.name}`);
      }
    }

    // Create demo users for each organization
    const demoUsers = [
      {
        name: 'John Doe',
        email: 'john@acme.com',
        role: 'owner',
        title: 'CISO',
        department: 'Security',
        isOrganizationAdmin: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane@acme.com',
        role: 'admin',
        title: 'Security Analyst',
        department: 'Security',
        isOrganizationAdmin: false,
      },
      {
        name: 'Bob Johnson',
        email: 'bob@globalind.com',
        role: 'owner',
        title: 'IT Director',
        department: 'IT',
        isOrganizationAdmin: true,
      },
      {
        name: 'Alice Wilson',
        email: 'alice@globalind.com',
        role: 'member',
        title: 'SOC Analyst',
        department: 'Security Operations',
        isOrganizationAdmin: false,
      },
    ];

    const createdUsers = [];
    for (const userData of demoUsers) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length === 0) {
        const passwordHash = await hashPassword('demo123');
        const [user] = await db
          .insert(users)
          .values({
            ...userData,
            passwordHash,
          })
          .returning();
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.name}`);
      } else {
        createdUsers.push(existingUser[0]);
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }

    // Add users to their organizations
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const orgIndex = i < 2 ? 0 : 1; // First 2 users go to first org, next 2 to second org
      const org = createdOrgs[orgIndex];

      const existingMembership = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
        .limit(1);

      if (existingMembership.length === 0) {
        await db.insert(teamMembers).values({
          userId: user.id,
          teamId: org.id,
          role: user.role,
        });
        console.log(`✅ Added ${user.name} to ${org.name}`);
      }
    }

    // Create demo activity logs
    const activities = [
      { userId: createdUsers[0].id, teamId: createdOrgs[0].id, action: ActivityType.SIGN_IN },
      { userId: createdUsers[1].id, teamId: createdOrgs[0].id, action: ActivityType.SIGN_IN },
      { userId: createdUsers[2].id, teamId: createdOrgs[1].id, action: ActivityType.CREATE_TEAM },
      { userId: createdUsers[0].id, teamId: createdOrgs[0].id, action: ActivityType.UPDATE_ACCOUNT },
      { userId: createdUsers[3].id, teamId: createdOrgs[1].id, action: ActivityType.SIGN_UP },
    ];

    for (const activity of activities) {
      await db.insert(activityLogs).values({
        ...activity,
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      });
    }
    console.log('✅ Created demo activity logs');

    console.log('🎉 Demo data seeding completed!');
    console.log('');
    console.log('Demo Accounts:');
    console.log('System Admin: admin@sekuriti.io / admin123');
    console.log('Acme Corp Owner: john@acme.com / demo123');
    console.log('Acme Corp Admin: jane@acme.com / demo123');
    console.log('Global Industries Owner: bob@globalind.com / demo123');
    console.log('Global Industries Member: alice@globalind.com / demo123');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

// Run this script directly
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}