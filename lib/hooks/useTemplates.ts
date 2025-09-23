'use client';

import useSWR from 'swr';
import { toast } from 'sonner';

export interface Template {
  id: number;
  title: string;
  category: string;
  subject?: string;
  content: string;
  tags: string[];
  variables?: string[];
  isDefault: boolean;
  isSystem?: boolean;
  organizationId: number | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  usageCount?: number;
  lastUsed?: Date | null;
  isFavorite?: boolean;
}

interface TemplatesResponse {
  templates: Template[];
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export function useTemplates(
  type: 'runbook' | 'communication',
  options?: {
    category?: string;
    search?: string;
    includeSystem?: boolean;
  }
) {
  const params = new URLSearchParams();
  if (options?.category) params.append('category', options.category);
  if (options?.search) params.append('search', options.search);
  if (options?.includeSystem !== undefined) {
    params.append('includeSystem', String(options.includeSystem));
  }

  const url = type === 'communication'
    ? `/api/communications/templates?${params}`
    : `/api/runbooks/templates?${params}`;

  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<TemplatesResponse>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // Cache for 30 seconds
  });

  const templates = data?.templates || [];

  // Separate system and organization templates
  const systemTemplates = templates.filter(t => !t.organizationId);
  const orgTemplates = templates.filter(t => !!t.organizationId);

  return {
    templates,
    systemTemplates,
    orgTemplates,
    isLoading,
    error,
    mutate,
    refresh: () => mutate()
  };
}

export function useTemplate(
  type: 'runbook' | 'communication',
  id: string | number
) {
  const url = type === 'communication'
    ? `/api/communications/templates/${id}`
    : `/api/runbooks/templates/${id}`;

  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<Template>(id ? url : null, fetcher);

  return {
    template: data,
    isLoading,
    error,
    mutate,
    refresh: () => mutate()
  };
}

export function useTemplateManagement(type: 'runbook' | 'communication') {
  const baseUrl = type === 'communication'
    ? '/api/communications/templates'
    : '/api/runbooks/templates';

  const createTemplate = async (data: {
    title: string;
    category: string;
    subject?: string;
    content: string;
    tags?: string[];
    isDefault?: boolean;
  }) => {
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const result = await response.json();
      toast.success('Template created successfully');
      return result;
    } catch (error) {
      toast.error('Failed to create template');
      throw error;
    }
  };

  const updateTemplate = async (id: string | number, data: {
    title?: string;
    category?: string;
    subject?: string;
    content?: string;
    tags?: string[];
  }) => {
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      const result = await response.json();
      toast.success('Template updated successfully');
      return result;
    } catch (error) {
      toast.error('Failed to update template');
      throw error;
    }
  };

  const deleteTemplate = async (id: string | number) => {
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
      throw error;
    }
  };

  const cloneTemplate = async (id: string | number) => {
    try {
      const response = await fetch(`${baseUrl}/${id}/clone`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clone template');
      }

      const result = await response.json();
      toast.success('Template cloned successfully');
      return result;
    } catch (error) {
      toast.error('Failed to clone template');
      throw error;
    }
  };

  const toggleFavorite = async (id: string | number) => {
    try {
      const response = await fetch(`${baseUrl}/${id}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      const result = await response.json();
      toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      return result;
    } catch (error) {
      toast.error('Failed to update favorite status');
      throw error;
    }
  };

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    toggleFavorite
  };
}