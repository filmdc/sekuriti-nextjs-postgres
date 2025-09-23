export interface OrganizationLimits {
  id: number;
  organizationId: number;

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
  apiRateLimit: number | null;
  apiCallsThisHour: number;
  apiResetAt: Date | null;

  // Feature limits
  customDomainsAllowed: boolean;
  whitelabelingAllowed: boolean;
  apiAccessAllowed: boolean;
  ssoAllowed: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceUsage {
  users: number;
  incidents: number;
  assets: number;
  runbooks: number;
  templates: number;
  storageMb: number;
  apiCallsThisHour: number;
}

export interface ResourceLimits {
  maxUsers: number;
  maxIncidents: number | null;
  maxAssets: number | null;
  maxRunbooks: number | null;
  maxTemplates: number | null;
  maxStorageMb: number;
  apiRateLimit: number | null;
}

export type ResourceType = 'users' | 'incidents' | 'assets' | 'runbooks' | 'templates' | 'storage';