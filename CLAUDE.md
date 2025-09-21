# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Run Next.js development server with Turbopack
- `pnpm build` - Build production application
- `pnpm start` - Start production server

### Database
- `pnpm db:setup` - Initial setup to create `.env` file
- `pnpm db:generate` - Generate Drizzle migrations from schema changes
- `pnpm db:migrate` - Apply database migrations
- `pnpm db:seed` - Seed database with test user (test@test.com / admin123)
- `pnpm db:studio` - Open Drizzle Studio for database visualization

### Stripe Webhooks (Local Development)
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Architecture

### Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT stored in httpOnly cookies
- **Payments**: Stripe subscriptions
- **UI**: Tailwind CSS 4 + shadcn/ui components

### Project Structure
```
app/
├── (dashboard)/     # Protected routes - authenticated users only
│   ├── dashboard/   # User dashboard pages
│   └── pricing/     # Pricing page with Stripe integration
├── (login)/        # Auth pages - sign-in/sign-up
│   └── actions.ts  # Server actions for authentication
└── api/            # API routes
    ├── stripe/     # Stripe webhook handlers
    └── team/       # Team management endpoints
```

### Key Patterns

#### Authentication & Authorization
- **Session Management**: JWT tokens in `lib/auth/session.ts` with automatic refresh on GET requests
- **Route Protection**: Global middleware (`middleware.ts`) protects `/dashboard/*` routes
- **Action Protection**: Server actions use validation middleware from `lib/auth/middleware.ts`:
  - `validatedAction()` - Schema validation with Zod
  - `validatedActionWithUser()` - Requires authenticated user
  - `withTeam()` - Requires team membership

#### Database Schema (`lib/db/schema.ts`)
- **Multi-tenancy**: Team-based architecture where users belong to teams
- **RBAC**: Role system with `owner` and `member` roles on `teamMembers`
- **Audit Trail**: `activityLogs` table tracks all user actions with `ActivityType` enum
- **Relationships**: Drizzle relations defined for efficient queries

#### Stripe Integration
- **Subscription Flow**:
  1. User selects plan → `createCheckoutSession()` in `lib/payments/stripe.ts`
  2. Webhook receives events → `app/api/stripe/webhook/route.ts`
  3. Subscription synced to `teams` table via `handleSubscriptionChange()`
- **Customer Portal**: Self-service subscription management via `createCustomerPortalSession()`

#### Server Actions Pattern
All mutations use Server Actions with consistent error handling:
```typescript
// In app/(login)/actions.ts
export const signIn = validatedAction(signInSchema, async (data) => {
  // Implementation with automatic validation
});
```

#### Activity Logging
User actions are logged via `logActivity()` helper:
- Tracks action type, user, team, timestamp, and IP
- Used for audit trails and security monitoring

## Environment Variables

Required in `.env`:
- `POSTGRES_URL` - Database connection string
- `AUTH_SECRET` - JWT signing key (generate: `openssl rand -base64 32`)
- `BASE_URL` - Application URL
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret