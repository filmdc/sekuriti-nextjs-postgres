import { FEATURES_BY_LICENSE, LicenseType, FeatureName, FeatureSet } from '@/lib/types/features';
import { FeatureNotAvailableError } from '@/lib/types/api-responses';
import { Team } from '@/lib/db/schema';

/**
 * Get the feature set for a given license type
 */
export function getFeaturesForLicense(licenseType: string): FeatureSet {
  const normalizedLicenseType = licenseType.toLowerCase() as LicenseType;

  if (!(normalizedLicenseType in FEATURES_BY_LICENSE)) {
    // Default to starter if license type is invalid
    return FEATURES_BY_LICENSE[LicenseType.STARTER];
  }

  return FEATURES_BY_LICENSE[normalizedLicenseType];
}

/**
 * Check if a feature is available for a given license type
 */
export function isFeatureAvailable(feature: FeatureName, licenseType: string): boolean {
  const features = getFeaturesForLicense(licenseType);
  return features[feature];
}

/**
 * Get the minimum license required for a feature
 */
export function getRequiredLicenseForFeature(feature: FeatureName): LicenseType | null {
  // Check each license tier from lowest to highest
  const tiers = [LicenseType.STARTER, LicenseType.PROFESSIONAL, LicenseType.ENTERPRISE];

  for (const tier of tiers) {
    if (FEATURES_BY_LICENSE[tier][feature]) {
      return tier;
    }
  }

  return null; // Feature not available in any tier
}

/**
 * Validate that a feature is available for the current organization's license
 * Throws FeatureNotAvailableError if not available
 */
export function requireFeature(
  feature: FeatureName,
  team: Team,
  upgradeUrl?: string
): void {
  const currentLicense = team.licenseType || 'starter';
  const isAvailable = isFeatureAvailable(feature, currentLicense);

  if (!isAvailable) {
    const requiredLicense = getRequiredLicenseForFeature(feature);

    throw new FeatureNotAvailableError(
      feature,
      requiredLicense || 'enterprise',
      currentLicense,
      upgradeUrl || `/pricing?upgrade=${feature}`
    );
  }
}

/**
 * Check feature availability without throwing (returns boolean)
 */
export function checkFeature(feature: FeatureName, team: Team): boolean {
  const currentLicense = team.licenseType || 'starter';
  return isFeatureAvailable(feature, currentLicense);
}

/**
 * Get all features available for a team's license
 */
export function getAvailableFeatures(team: Team): FeatureSet {
  const currentLicense = team.licenseType || 'starter';
  return getFeaturesForLicense(currentLicense);
}

/**
 * Get a list of features that require an upgrade
 */
export function getUnavailableFeatures(team: Team): Array<{
  feature: FeatureName;
  requiredLicense: LicenseType | null;
}> {
  const currentLicense = team.licenseType || 'starter';
  const currentFeatures = getFeaturesForLicense(currentLicense);

  const unavailableFeatures: Array<{
    feature: FeatureName;
    requiredLicense: LicenseType | null;
  }> = [];

  // Check all possible features
  const allFeatures = Object.keys(FEATURES_BY_LICENSE[LicenseType.ENTERPRISE]) as FeatureName[];

  for (const feature of allFeatures) {
    if (!currentFeatures[feature]) {
      const requiredLicense = getRequiredLicenseForFeature(feature);
      unavailableFeatures.push({
        feature,
        requiredLicense
      });
    }
  }

  return unavailableFeatures;
}

/**
 * Higher-order function to wrap actions with feature requirements
 */
export function withFeatureRequirement<T extends any[], R>(
  feature: FeatureName,
  action: (...args: T) => Promise<R>
) {
  return async (team: Team, ...args: T): Promise<R> => {
    requireFeature(feature, team);
    return action(...args);
  };
}

/**
 * License upgrade utility functions
 */
export const LicenseUpgrade = {
  /**
   * Get upgrade path for a feature
   */
  getUpgradePath(feature: FeatureName, currentLicense: string): {
    target: LicenseType | null;
    url: string;
  } {
    const requiredLicense = getRequiredLicenseForFeature(feature);

    return {
      target: requiredLicense,
      url: `/pricing?upgrade=${feature}&from=${currentLicense}&to=${requiredLicense}`
    };
  },

  /**
   * Get upgrade recommendations based on usage patterns
   */
  getRecommendations(team: Team, recentlyAttemptedFeatures: FeatureName[]): {
    recommendedTier: LicenseType;
    benefits: string[];
    blockedFeatures: FeatureName[];
  } {
    const currentLicense = team.licenseType || 'starter';
    const currentTier = currentLicense.toLowerCase() as LicenseType;

    // Determine next tier
    let recommendedTier: LicenseType;
    if (currentTier === LicenseType.STARTER) {
      recommendedTier = LicenseType.PROFESSIONAL;
    } else if (currentTier === LicenseType.PROFESSIONAL) {
      recommendedTier = LicenseType.ENTERPRISE;
    } else {
      recommendedTier = LicenseType.ENTERPRISE; // Already at highest
    }

    const currentFeatures = FEATURES_BY_LICENSE[currentTier];
    const upgradeFeatures = FEATURES_BY_LICENSE[recommendedTier];

    // Get benefits of upgrading
    const benefits: string[] = [];
    const blockedFeatures: FeatureName[] = [];

    Object.entries(upgradeFeatures).forEach(([feature, available]) => {
      if (available && !currentFeatures[feature as FeatureName]) {
        benefits.push(feature);

        if (recentlyAttemptedFeatures.includes(feature as FeatureName)) {
          blockedFeatures.push(feature as FeatureName);
        }
      }
    });

    return {
      recommendedTier,
      benefits,
      blockedFeatures
    };
  }
};