import { ResourceUsage, ResourceLimits, ResourceType } from './limits';
import { FeatureSet } from './features';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class QuotaExceededError extends Error {
  public readonly statusCode = 402;
  public readonly code = 'QUOTA_EXCEEDED';

  constructor(
    public readonly resourceType: ResourceType,
    public readonly current: number,
    public readonly limit: number,
    public readonly upgradeUrl?: string
  ) {
    super(`Quota exceeded for ${resourceType}: ${current}/${limit}`);
    this.name = 'QuotaExceededError';
  }

  toJSON() {
    return {
      error: 'QUOTA_EXCEEDED',
      message: this.message,
      resourceType: this.resourceType,
      current: this.current,
      limit: this.limit,
      upgradeUrl: this.upgradeUrl,
      statusCode: this.statusCode
    };
  }
}

export class FeatureNotAvailableError extends Error {
  public readonly statusCode = 403;
  public readonly code = 'FEATURE_NOT_AVAILABLE';

  constructor(
    public readonly feature: string,
    public readonly requiredLicense: string,
    public readonly currentLicense: string,
    public readonly upgradeUrl?: string
  ) {
    super(`Feature '${feature}' requires ${requiredLicense} license. Current: ${currentLicense}`);
    this.name = 'FeatureNotAvailableError';
  }

  toJSON() {
    return {
      error: 'FEATURE_NOT_AVAILABLE',
      message: this.message,
      feature: this.feature,
      requiredLicense: this.requiredLicense,
      currentLicense: this.currentLicense,
      upgradeUrl: this.upgradeUrl,
      statusCode: this.statusCode
    };
  }
}

export class RateLimitExceededError extends Error {
  public readonly statusCode = 429;
  public readonly code = 'RATE_LIMIT_EXCEEDED';

  constructor(
    public readonly current: number,
    public readonly limit: number,
    public readonly resetAt: Date
  ) {
    super(`Rate limit exceeded: ${current}/${limit}. Resets at ${resetAt.toISOString()}`);
    this.name = 'RateLimitExceededError';
  }

  toJSON() {
    return {
      error: 'RATE_LIMIT_EXCEEDED',
      message: this.message,
      current: this.current,
      limit: this.limit,
      resetAt: this.resetAt.toISOString(),
      statusCode: this.statusCode
    };
  }
}

export interface UsageResponse extends ApiResponse {
  data: {
    usage: ResourceUsage;
    limits: ResourceLimits;
    features: FeatureSet;
    percentages: Record<ResourceType, number>;
  };
}

export interface LimitsResponse extends ApiResponse {
  data: {
    limits: ResourceLimits;
    features: FeatureSet;
    licenseType: string;
    organizationId: number;
  };
}

export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  error?: QuotaExceededError;
}

export type ErrorResponse = {
  error: string;
  message: string;
  statusCode: number;
  [key: string]: any;
};