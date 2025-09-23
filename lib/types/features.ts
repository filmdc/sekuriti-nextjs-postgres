export enum LicenseType {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

export interface FeatureSet {
  // Core features
  incidents: boolean;
  assets: boolean;
  runbooks: boolean;
  communications: boolean;
  exercises: boolean;

  // Advanced features
  customDomains: boolean;
  whitelabeling: boolean;
  apiAccess: boolean;
  ssoAuthentication: boolean;
  advancedReporting: boolean;
  bulkOperations: boolean;
  automatedWorkflows: boolean;

  // Integration features
  webhooks: boolean;
  thirdPartyIntegrations: boolean;
  customFields: boolean;

  // Collaboration features
  realTimeCollaboration: boolean;
  teamManagement: boolean;
  roleBasedAccess: boolean;

  // Compliance features
  auditLogs: boolean;
  complianceReporting: boolean;
  dataRetention: boolean;
}

export const FEATURES_BY_LICENSE: Record<LicenseType, FeatureSet> = {
  [LicenseType.STARTER]: {
    // Core features
    incidents: true,
    assets: true,
    runbooks: true,
    communications: true,
    exercises: false, // Limited in starter

    // Advanced features
    customDomains: false,
    whitelabeling: false,
    apiAccess: false,
    ssoAuthentication: false,
    advancedReporting: false,
    bulkOperations: false,
    automatedWorkflows: false,

    // Integration features
    webhooks: false,
    thirdPartyIntegrations: false,
    customFields: false,

    // Collaboration features
    realTimeCollaboration: false,
    teamManagement: true, // Basic team management
    roleBasedAccess: true, // Basic RBAC

    // Compliance features
    auditLogs: true, // Basic audit logs
    complianceReporting: false,
    dataRetention: false,
  },

  [LicenseType.PROFESSIONAL]: {
    // Core features
    incidents: true,
    assets: true,
    runbooks: true,
    communications: true,
    exercises: true,

    // Advanced features
    customDomains: false,
    whitelabeling: false,
    apiAccess: true,
    ssoAuthentication: false,
    advancedReporting: true,
    bulkOperations: true,
    automatedWorkflows: true,

    // Integration features
    webhooks: true,
    thirdPartyIntegrations: true,
    customFields: true,

    // Collaboration features
    realTimeCollaboration: true,
    teamManagement: true,
    roleBasedAccess: true,

    // Compliance features
    auditLogs: true,
    complianceReporting: true,
    dataRetention: true,
  },

  [LicenseType.ENTERPRISE]: {
    // Core features
    incidents: true,
    assets: true,
    runbooks: true,
    communications: true,
    exercises: true,

    // Advanced features
    customDomains: true,
    whitelabeling: true,
    apiAccess: true,
    ssoAuthentication: true,
    advancedReporting: true,
    bulkOperations: true,
    automatedWorkflows: true,

    // Integration features
    webhooks: true,
    thirdPartyIntegrations: true,
    customFields: true,

    // Collaboration features
    realTimeCollaboration: true,
    teamManagement: true,
    roleBasedAccess: true,

    // Compliance features
    auditLogs: true,
    complianceReporting: true,
    dataRetention: true,
  }
};

export type FeatureName = keyof FeatureSet;