// License and quota types for the frontend
export type LicenseType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface OrganizationLimits {
  // User limits
  maxUsers: number;
  currentUsers: number;

  // Storage limits (in MB)
  maxStorageMb: number;
  currentStorageMb: number;

  // Entity limits
  maxIncidents: number | null;
  maxAssets: number | null;
  maxRunbooks: number | null;
  maxTemplates: number | null;

  // API limits
  apiRateLimit: number;
  apiCallsThisHour: number;
  apiResetAt: Date | null;

  // Feature limits
  customDomainsAllowed: boolean;
  whitelabelingAllowed: boolean;
  apiAccessAllowed: boolean;
  ssoAllowed: boolean;
}

export interface QuotaUsage {
  resource: string;
  current: number;
  limit: number | null;
  percentage: number;
  status: 'healthy' | 'warning' | 'critical' | 'exceeded';
}

export interface FeatureGate {
  feature: string;
  enabled: boolean;
  requiredLicense: LicenseType;
  message?: string;
}

export interface QuotaError {
  code: 'QUOTA_EXCEEDED';
  message: string;
  resource: string;
  current: number;
  limit: number;
  upgradeUrl?: string;
}

export interface FeatureError {
  code: 'FEATURE_RESTRICTED';
  message: string;
  feature: string;
  requiredLicense: LicenseType;
  upgradeUrl?: string;
}

// Helper to calculate quota status
export function getQuotaStatus(current: number, limit: number | null): QuotaUsage['status'] {
  if (!limit) return 'healthy';
  const percentage = (current / limit) * 100;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 80) return 'warning';
  return 'healthy';
}

// Helper to format storage
export function formatStorage(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb} MB`;
}

// License feature matrix
export const FEATURE_MATRIX: Record<string, LicenseType[]> = {
  sso: ['ENTERPRISE'],
  customDomains: ['PROFESSIONAL', 'ENTERPRISE'],
  whitelabeling: ['ENTERPRISE'],
  apiAccess: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
  advancedReporting: ['PROFESSIONAL', 'ENTERPRISE'],
  auditLogs: ['PROFESSIONAL', 'ENTERPRISE'],
  customIntegrations: ['ENTERPRISE'],
  prioritySupport: ['PROFESSIONAL', 'ENTERPRISE'],
  unlimitedUsers: ['ENTERPRISE'],
  bulkOperations: ['PROFESSIONAL', 'ENTERPRISE'],
};

// Default limits by license type
export const DEFAULT_LIMITS: Record<LicenseType, Partial<OrganizationLimits>> = {
  STARTER: {
    maxUsers: 5,
    maxStorageMb: 1024, // 1 GB
    maxIncidents: 100,
    maxAssets: 500,
    maxRunbooks: 50,
    maxTemplates: 100,
    apiRateLimit: 1000,
    customDomainsAllowed: false,
    whitelabelingAllowed: false,
    apiAccessAllowed: true,
    ssoAllowed: false,
  },
  PROFESSIONAL: {
    maxUsers: 25,
    maxStorageMb: 10240, // 10 GB
    maxIncidents: 1000,
    maxAssets: 5000,
    maxRunbooks: 500,
    maxTemplates: 1000,
    apiRateLimit: 10000,
    customDomainsAllowed: true,
    whitelabelingAllowed: false,
    apiAccessAllowed: true,
    ssoAllowed: false,
  },
  ENTERPRISE: {
    maxUsers: null, // Unlimited
    maxStorageMb: null, // Unlimited
    maxIncidents: null,
    maxAssets: null,
    maxRunbooks: null,
    maxTemplates: null,
    apiRateLimit: null, // Unlimited
    customDomainsAllowed: true,
    whitelabelingAllowed: true,
    apiAccessAllowed: true,
    ssoAllowed: true,
  },
};