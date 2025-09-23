🎯 Implementation Plan for Frontend & Backend Developer Agents

  Phase 1: Critical Security Implementation

  Objective: Stop revenue bleeding and enforce business model

  Backend Agent Tasks:

  // Priority: CRITICAL - Implement immediately
  1. Create quota enforcement middleware:
     - lib/middleware/quota-enforcement.ts
     - Validate against organizationLimits table
     - Return proper error codes (402 Payment Required, 403 Forbidden)

  2. Implement license feature gating:
     - lib/auth/license-gating.ts
     - Define FEATURES_BY_LICENSE constant
     - Create requireFeature() validation function

  3. Add validation to all resource creation endpoints:
     - Update createIncident, createAsset, inviteUser actions
     - Add quota checks before database operations
     - Update organizationLimits counters after successful creation

  4. Create usage tracking endpoints:
     - GET /api/organization/usage - current usage stats
     - GET /api/organization/limits - current limits

  Frontend Agent Tasks:

  // Priority: CRITICAL - Implement immediately
  1. Add quota error handling to all forms:
     - Show user-friendly error messages for quota exceeded
     - Display current usage vs limits in UI
     - Add progress bars showing usage percentage

  2. Implement feature gating in UI:
     - Hide/disable features based on license type
     - Add upgrade prompts for restricted features
     - Create FeatureGate component wrapper

  3. Add usage indicators:
     - Dashboard widgets showing quota usage
     - Warning badges when approaching limits (80%, 90%)
     - Blocking modals when limits reached

  Coordination Points:

  - Define shared TypeScript interfaces for quotas and features
  - Agree on error response format and codes
  - Create shared constants file for feature names

  ---
  Phase 2A: Content Management Track

  Objective: Enable dynamic configuration without deployments

  Backend Agent Tasks:

  1. System Templates API:
     - GET /api/system-admin/content/templates
     - POST /api/system-admin/content/templates
     - PUT /api/system-admin/content/templates/[id]
     - DELETE /api/system-admin/content/templates/[id]
     - GET /api/organization/templates (merged system + org)

  2. Global Dropdowns API:
     - CRUD endpoints for system dropdowns
     - GET /api/dropdowns/[category] (merged for users)
     - Caching layer for performance

  3. Default Tags API:
     - System tag management endpoints
     - Organization tag inheritance logic
     - Tag template provisioning

  Frontend Agent Tasks:

  1. Update admin content pages:
     - Replace mock data with API calls
     - Add loading states and error handling
     - Implement CRUD operations with toast notifications

  2. Update user forms to use dynamic dropdowns:
     - Create useDropdowns() hook
     - Replace hardcoded options with API data
     - Add fallback for offline/error states

  3. Implement template selector:
     - Create TemplateSelector component
     - Show system and org templates separately
     - Add template preview functionality

  Coordination Points:

  - API response format for merged system/org data
  - Caching strategy for frequently accessed data
  - Template variable format and parsing

  ---
  Phase 2B: Billing & Monitoring Track

  Objective: Provide real business insights and monitoring

  Backend Agent Tasks:

  1. Billing Analytics API:
     - /api/system-admin/billing/overview
     - /api/system-admin/billing/revenue
     - /api/system-admin/billing/subscriptions
     - Integration with Stripe webhook data

  2. License Management API:
     - CRUD for licenses
     - Seat tracking endpoints
     - Expiration monitoring

  3. Usage Reports API:
     - Aggregated usage statistics
     - Resource consumption trends
     - Per-organization breakdowns

  4. Health Monitoring API:
     - System health metrics
     - Service status checks
     - Performance indicators

  Frontend Agent Tasks:

  1. Replace mock data in billing pages:
     - Connect to real revenue data
     - Implement data refresh intervals
     - Add export functionality

  2. Create monitoring dashboards:
     - Real-time health status indicators
     - Performance graphs using Recharts
     - Alert notification system

  3. Build usage report visualizations:
     - Interactive charts for usage trends
     - Drill-down capabilities
     - Comparison views

  Coordination Points:

  - Data aggregation intervals and formats
  - WebSocket vs polling for real-time data
  - Chart data structure specifications

  ---
  Phase 3: Settings & Advanced Features

  Objective: Complete admin control and system configuration

  Backend Agent Tasks:

  1. System Settings API:
     - General settings CRUD
     - Email configuration management
     - Security policy endpoints

  2. API Key Management:
     - Secure key generation
     - Permission scoping
     - Rate limit configuration

  3. Audit Log Enhancements:
     - Advanced query filters
     - Export functionality
     - Retention policies

  Frontend Agent Tasks:

  1. Settings management UI:
     - Form builders for different setting types
     - Validation and preview
     - Change history tracking

  2. API key interface:
     - Key generation wizard
     - Permission matrix UI
     - Usage statistics display

  3. Audit log viewer:
     - Advanced filter UI
     - Pagination and search
     - Export options

  Coordination Points:

  - Settings schema and validation rules
  - API key permission structure
  - Audit log query parameters

  ---
  Phase 4: Integration & Optimization

  Objective: Ensure everything works together seamlessly

  Both Agents - Joint Tasks:

  1. End-to-end testing:
     - Critical user journeys
     - Admin configuration flows
     - Quota enforcement scenarios

  2. Performance optimization:
     - Database query optimization
     - Frontend bundle size reduction
     - Caching implementation

  3. Error handling review:
     - Consistent error messages
     - Graceful degradation
     - Offline support where applicable

  4. Documentation:
     - API documentation
     - Admin user guide
     - Developer documentation

  ---
  📋 Shared Implementation Requirements

  Shared Type Definitions:

  // shared/types/limits.ts
  interface OrganizationLimits {
    maxUsers: number;
    maxIncidents: number;
    maxAssets: number;
    maxRunbooks: number;
    maxStorageMb: number;
    // ... etc
  }

  // shared/types/features.ts
  enum LicenseType {
    STARTER = 'starter',
    PROFESSIONAL = 'professional',
    ENTERPRISE = 'enterprise'
  }

  interface FeatureSet {
    sso: boolean;
    whitelabeling: boolean;
    customDomains: boolean;
    advancedReporting: boolean;
    // ... etc
  }

  // shared/types/api-responses.ts
  interface QuotaExceededError {
    code: 'QUOTA_EXCEEDED';
    resource: string;
    current: number;
    limit: number;
    upgradeUrl: string;
  }

  API Contract Standards:

  // All list endpoints should support:
  interface ListParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }

  // All responses should follow:
  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    metadata?: {
      total?: number;
      page?: number;
      limit?: number;
    };
  }

  Error Handling Convention:

  // Backend throws specific errors
  class QuotaExceededError extends Error {
    code = 'QUOTA_EXCEEDED';
    statusCode = 402;
  }

  class FeatureNotAvailableError extends Error {
    code = 'FEATURE_RESTRICTED';
    statusCode = 403;
  }

  // Frontend handles gracefully
  function handleApiError(error: ApiError) {
    switch(error.code) {
      case 'QUOTA_EXCEEDED':
        showUpgradeModal(error.data);
        break;
      case 'FEATURE_RESTRICTED':
        showFeatureLockedModal(error.data);
        break;
      default:
        showGenericError(error.message);
    }
  }

  🔄 Coordination Protocol

  Before Starting Each Phase:

  1. Review shared type definitions
  2. Agree on API endpoints and contracts
  3. Create stub responses for parallel development

  During Implementation:

  1. Use feature branches for each component
  2. Create pull requests for review
  3. Test integration points early
  4. Document any contract changes

  After Each Phase:

  1. Integration testing
  2. Performance review
  3. Security audit for new endpoints
  4. Update documentation

  ✅ Success Criteria

  Phase 1 Complete When:

  - No user can exceed their quotas
  - Features are properly gated by license
  - UI shows clear feedback on limits

  Phase 2 Complete When:

  - All admin configurations affect user experience
  - Billing data is real and accurate
  - Monitoring provides actionable insights

  Phase 3 Complete When:

  - System is fully configurable via admin UI
  - Audit trail is comprehensive
  - API keys work with proper permissions

  Phase 4 Complete When:

  - All integration tests pass
  - Performance meets benchmarks
  - Documentation is complete
