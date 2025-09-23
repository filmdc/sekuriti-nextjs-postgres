// Shared types for API responses and requests

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
}

// Request validation schemas
export interface CreateSystemTemplateRequest {
  title: string;
  category: string;
  description?: string;
  content: string;
  variables?: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    defaultValue?: any;
  }>;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateSystemTemplateRequest extends Partial<CreateSystemTemplateRequest> {
  isActive?: boolean;
  sortOrder?: number;
  version?: string;
}

export interface CreateSystemDropdownRequest {
  category: string;
  name: string;
  description?: string;
  options: Array<{
    value: string;
    label: string;
    metadata?: Record<string, any>;
  }>;
  allowCustomValues?: boolean;
  sortOrder?: number;
}

export interface UpdateSystemDropdownRequest extends Partial<CreateSystemDropdownRequest> {
  isActive?: boolean;
}

export interface CreateDefaultTagRequest {
  name: string;
  description?: string;
  tagSet: Array<{
    name: string;
    category: string;
    color: string;
    description?: string;
  }>;
  entityTypes: string[];
  isRequired?: boolean;
  sortOrder?: number;
}

export interface UpdateDefaultTagRequest extends Partial<CreateDefaultTagRequest> {
  isActive?: boolean;
}

// Cache key generators
export class CacheKeys {
  static systemTemplates(category?: string) {
    return category ? `system_templates:${category}` : 'system_templates:all';
  }

  static systemDropdowns(category?: string) {
    return category ? `system_dropdowns:${category}` : 'system_dropdowns:all';
  }

  static organizationDropdowns(orgId: number, category?: string) {
    return category
      ? `org_dropdowns:${orgId}:${category}`
      : `org_dropdowns:${orgId}:all`;
  }

  static mergedDropdowns(orgId: number, category?: string) {
    return category
      ? `merged_dropdowns:${orgId}:${category}`
      : `merged_dropdowns:${orgId}:all`;
  }

  static defaultTags() {
    return 'default_tags:all';
  }

  static effectiveTags(orgId: number) {
    return `effective_tags:${orgId}`;
  }
}

// Rate limiting configuration
export const RATE_LIMITS = {
  SYSTEM_ADMIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
  },
  ORGANIZATION_READ: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // requests per window
  },
  ORGANIZATION_WRITE: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  DROPDOWN_READ: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, // requests per window (cached responses)
  },
} as const;

// Cache TTL configuration
export const CACHE_TTL = {
  SYSTEM_TEMPLATES: 5 * 60, // 5 minutes
  SYSTEM_DROPDOWNS: 5 * 60, // 5 minutes
  ORGANIZATION_DROPDOWNS: 2 * 60, // 2 minutes
  MERGED_DROPDOWNS: 5 * 60, // 5 minutes
  DEFAULT_TAGS: 10 * 60, // 10 minutes
  EFFECTIVE_TAGS: 5 * 60, // 5 minutes
} as const;