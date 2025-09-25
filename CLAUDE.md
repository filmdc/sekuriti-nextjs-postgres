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
- **Authentication**: JWT stored in httpOnly cookies with 2FA support
- **Payments**: Stripe subscriptions
- **UI**: Tailwind CSS 4 + shadcn/ui components
- **Email**: Resend for 2FA and notifications

### Project Structure
```
app/
├── (dashboard)/          # Protected routes - authenticated users only
│   ├── dashboard/        # User dashboard pages
│   ├── incidents/        # Incident response management
│   ├── assets/          # Asset inventory and management
│   ├── runbooks/        # Response procedures and execution
│   ├── communications/  # Template management with variables
│   ├── exercises/       # Training and tabletop exercises
│   ├── organization/    # Team, billing, settings, tags
│   └── pricing/         # Pricing page with Stripe integration
├── (login)/             # Auth pages - sign-in/sign-up with 2FA
│   └── actions.ts       # Server actions for authentication
└── api/                 # API routes
    ├── stripe/          # Stripe webhook handlers
    ├── incidents/       # Incident management endpoints
    ├── assets/          # Asset CRUD operations
    ├── runbooks/        # Runbook execution tracking
    ├── organization/    # Team, billing, tags, insurance
    └── communications/  # Template management
```

### Key Patterns

#### Authentication & Authorization
- **Session Management**: JWT tokens in `lib/auth/session.ts` with automatic refresh on GET requests
- **Route Protection**: Global middleware (`middleware.ts`) protects `/dashboard/*` routes
- **Action Protection**: Server actions use validation middleware from `lib/auth/middleware.ts`:
  - `validatedAction()` - Schema validation with Zod
  - `validatedActionWithUser()` - Requires authenticated user
  - `withTeam()` - Requires team membership

#### Database Schema
- **Core Schema** (`lib/db/schema.ts`): Multi-tenancy, RBAC, audit trails
- **IR Schema** (`lib/db/schema-ir.ts`): Incidents, assets, runbooks, training, communications
- **Tagging Schema** (`lib/db/schema-tags.ts`): Polymorphic tagging and asset grouping
- **Multi-tenancy**: Team-based architecture where users belong to teams
- **RBAC**: Role system with `owner`, `admin`, and `member` roles
- **Audit Trail**: Comprehensive logging with `ActivityType` enum
- **Incident Response**: 6-phase incident lifecycle (Detection → Post-Incident)
- **Asset Management**: Full asset inventory with criticality levels and tagging
- **Polymorphic Tagging**: Universal tagging system across all entities
- **Hierarchical Grouping**: Asset grouping with dynamic rules

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
- `RESEND_API_KEY` - Resend API key for 2FA and notifications

## Cybersecurity Features

### Incident Response Platform
- **6-Phase Incident Lifecycle**: Detection, Containment, Eradication, Recovery, Post-Incident, Closure
- **Asset-Centric Response**: Link incidents to affected assets and responsible teams
- **Runbook Execution**: Step-by-step guided response with evidence collection
- **Communication Templates**: Variable-based stakeholder messaging
- **Training Module**: Tabletop exercises and scenario simulations

### Asset Management
- **Comprehensive Inventory**: Hardware, software, services, people, data
- **Criticality Levels**: Critical, High, Medium, Low with visual indicators
- **Polymorphic Tagging**: Universal tagging system across all entities
- **Asset Grouping**: Hierarchical organization with dynamic rules
- **Bulk Operations**: Efficient management of large asset inventories

### Security Features
- **2FA Authentication**: Email-based two-factor authentication
- **Role-Based Access**: Owner, Admin, Member with appropriate permissions
- **Audit Logging**: Comprehensive activity tracking for compliance
- **Organization Settings**: Insurance, billing, team management
- **Tag Governance**: Centralized tag management and policies

### UX Enhancements (Latest)
- **Professional Design System**: Enterprise-grade UI with cybersecurity-specific indicators
- **Mobile-First**: Optimized for incident response in the field
- **Navigation System**: Breadcrumbs, sidebar, and global search
- **Form Enhancements**: Auto-save, validation, optimistic UI
- **User Feedback**: Loading states, confirmations, progress tracking
- **Visual Consistency**: Standardized spacing, typography, and status colors
- ensure that front end development always basis interface off of the actual database, and that all fields and metrics and reports are tied to the actual database. do not create mock pages, fake data, or the like. all funcitons in this system are to relate to actual database data sources. if the database is lacking fields and tables that are needed, propose making database changes to the user before proceeding. 