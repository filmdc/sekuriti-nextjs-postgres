import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { users, teamMembers, ActivityType } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

// POST /api/system-admin/users/create - Create a new user
export const POST = withSystemAdmin(async (req: NextRequest, context: any) => {
  try {
    const data = await req.json();
    const {
      email,
      name,
      password,
      isSystemAdmin = false,
      teamId,
      role = 'member',
    } = data;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        role: isSystemAdmin ? 'admin' : 'member',
        isSystemAdmin,
        // System admin created users start with basic setup
      })
      .returning();

    // If teamId is provided, add user to team
    if (teamId && role) {
      await db.insert(teamMembers).values({
        userId: newUser.id,
        teamId: parseInt(teamId),
        role,
      });
    }

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.ADD_USER,
      entityType: 'user',
      entityId: newUser.id,
      organizationId: teamId ? parseInt(teamId) : undefined,
      metadata: {
        email,
        name,
        isSystemAdmin,
        teamId,
        role,
      },
    });

    // Return user data (without password hash)
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
});