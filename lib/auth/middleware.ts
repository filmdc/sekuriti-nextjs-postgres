import { z } from 'zod';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { enforceQuota, updateResourceCount } from '@/lib/middleware/quota-enforcement';
import { ResourceType } from '@/lib/types/limits';
import { FeatureName } from '@/lib/types/features';
import { QuotaExceededError, FeatureNotAvailableError } from '@/lib/types/api-responses';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

export type QuotaOptions = {
  resourceType: ResourceType;
  incrementBy?: number;
};

export type FeatureOptions = {
  feature: FeatureName;
  upgradeUrl?: string;
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

type ValidatedActionWithUserAndTeamFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User,
  team: TeamDataWithMembers
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

/**
 * Enhanced middleware that includes both user and team, plus quota/feature enforcement
 */
export function validatedActionWithUserAndTeam<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserAndTeamFunction<S, T>,
  options?: {
    quota?: QuotaOptions;
    feature?: FeatureOptions;
  }
) {
  return async (prevState: ActionState, formData: FormData) => {
    try {
      const user = await getUser();
      if (!user) {
        return { error: 'User is not authenticated' };
      }

      const team = await getTeamForUser();
      if (!team) {
        return { error: 'Organization not found' };
      }

      const result = schema.safeParse(Object.fromEntries(formData));
      if (!result.success) {
        return { error: result.error.errors[0].message };
      }

      // Feature checking removed - now handled by subscription plans

      // Check quota requirements before execution
      if (options?.quota) {
        try {
          await enforceQuota(
            team.id,
            options.quota.resourceType,
            options.quota.incrementBy || 1
          );
        } catch (error) {
          if (error instanceof QuotaExceededError) {
            return {
              error: error.message,
              quotaExceeded: true,
              resourceType: error.resourceType,
              current: error.current,
              limit: error.limit,
              upgradeUrl: error.upgradeUrl
            };
          }
          throw error;
        }
      }

      // Execute the action
      const actionResult = await action(result.data, formData, user, team);

      // Update resource count after successful execution
      if (options?.quota) {
        await updateResourceCount(
          team.id,
          options.quota.resourceType,
          options.quota.incrementBy || 1
        );
      }

      return actionResult;

    } catch (error) {
      console.error('Action execution error:', error);

      // Handle known error types
      if (error instanceof QuotaExceededError) {
        return {
          error: error.message,
          quotaExceeded: true,
          resourceType: error.resourceType,
          current: error.current,
          limit: error.limit,
          upgradeUrl: error.upgradeUrl
        };
      }

      if (error instanceof FeatureNotAvailableError) {
        return {
          error: error.message,
          upgradeUrl: error.upgradeUrl,
          featureRequired: error.feature,
          requiredLicense: error.requiredLicense
        };
      }

      return {
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }

    const team = await getTeamForUser();
    if (!team) {
      throw new Error('Team not found');
    }

    return action(formData, team);
  };
}
