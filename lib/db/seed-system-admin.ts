import { db } from './drizzle';
import { users, teams, teamMembers, activityLogs, ActivityType } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

async function seedSystemAdminData() {
  console.log('Seeding system admin test data...');

  // Create system admin user if it doesn't exist
  const adminPassword = await hashPassword('admin123');

  let systemAdmin;
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@sekuriti.io'))
    .limit(1);

  if (existingAdmin.length === 0) {
    [systemAdmin] = await db
      .insert(users)
      .values({
        email: 'admin@sekuriti.io',
        name: 'System Administrator',
        passwordHash: adminPassword,
        role: 'admin',
        isSystemAdmin: true,
        isOrganizationAdmin: false,
      })
      .returning();
    console.log('System admin user created');
  } else {
    systemAdmin = existingAdmin[0];
    console.log('System admin user already exists');
  }

  // Create test organizations
  const organizations = [
    {
      name: 'TechCorp Inc',
      industry: 'Technology',
      size: 'large',
      status: 'active' as const,
      licenseType: 'enterprise',
      licenseCount: 50,
      website: 'https://techcorp.com',
    },
    {
      name: 'FinanceFlow LLC',
      industry: 'Finance',
      size: 'medium',
      status: 'active' as const,
      licenseType: 'professional',
      licenseCount: 25,
      website: 'https://financeflow.com',
    },
    {
      name: 'StartupX',
      industry: 'Technology',
      size: 'small',
      status: 'trial' as const,
      licenseType: 'standard',
      licenseCount: 10,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    {
      name: 'HealthCarePlus',
      industry: 'Healthcare',
      size: 'large',
      status: 'active' as const,
      licenseType: 'enterprise',
      licenseCount: 100,
      website: 'https://healthcareplus.com',
    },
    {
      name: 'RetailChain Co',
      industry: 'Retail',
      size: 'medium',
      status: 'active' as const,
      licenseType: 'professional',
      licenseCount: 30,
    },
  ];

  const createdOrgs = await db
    .insert(teams)
    .values(organizations)
    .returning();

  console.log(`Created ${createdOrgs.length} test organizations`);

  // Create test users for each organization
  const testUsers = [];
  const userPasswords = await hashPassword('password123');

  for (const org of createdOrgs) {
    // Create owner
    const [owner] = await db
      .insert(users)
      .values({
        email: `owner@${org.name.toLowerCase().replace(/\s+/g, '')}.com`,
        name: `${org.name} Owner`,
        passwordHash: userPasswords,
        role: 'owner',
        isOrganizationAdmin: true,
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random login within last week
      })
      .returning();

    await db.insert(teamMembers).values({
      userId: owner.id,
      teamId: org.id,
      role: 'owner',
    });

    testUsers.push(owner);

    // Create some admins and members
    const roleCount = Math.floor(Math.random() * 3) + 2; // 2-4 additional users per org

    for (let i = 0; i < roleCount; i++) {
      const role = i === 0 ? 'admin' : 'member';
      const [user] = await db
        .insert(users)
        .values({
          email: `${role}${i}@${org.name.toLowerCase().replace(/\s+/g, '')}.com`,
          name: `${org.name} ${role.charAt(0).toUpperCase() + role.slice(1)} ${i + 1}`,
          passwordHash: userPasswords,
          role,
          isOrganizationAdmin: role === 'admin',
          lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null, // 70% chance of login
        })
        .returning();

      await db.insert(teamMembers).values({
        userId: user.id,
        teamId: org.id,
        role,
      });

      testUsers.push(user);
    }
  }

  console.log(`Created ${testUsers.length} test users across organizations`);

  // Create some activity logs
  const activities = [];
  const activityTypes = [
    ActivityType.SIGN_IN,
    ActivityType.SIGN_UP,
    ActivityType.CREATE_TEAM,
    ActivityType.UPDATE_ACCOUNT,
    ActivityType.INVITE_TEAM_MEMBER,
    ActivityType.CREATE_INCIDENT,
    ActivityType.UPDATE_INCIDENT,
    ActivityType.CREATE_ASSET,
  ];

  for (let i = 0; i < 50; i++) {
    const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
    const randomOrg = createdOrgs[Math.floor(Math.random() * createdOrgs.length)];
    const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    activities.push({
      userId: randomUser.id,
      teamId: randomOrg.id,
      action: randomActivity,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time within last 30 days
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    });
  }

  await db.insert(activityLogs).values(activities);
  console.log(`Created ${activities.length} activity log entries`);

  console.log('System admin test data seeded successfully!');
  console.log('\nTest accounts created:');
  console.log('System Admin: admin@sekuriti.io / admin123');
  console.log('Regular Test User: test@test.com / admin123');

  console.log('\nOrganization owners:');
  for (const org of createdOrgs) {
    console.log(`${org.name}: owner@${org.name.toLowerCase().replace(/\s+/g, '')}.com / password123`);
  }
}

seedSystemAdminData()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });