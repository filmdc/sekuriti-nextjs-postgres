'use client';

import useSWR from 'swr';
import { toast } from 'sonner';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface DropdownCategory {
  id: string;
  name: string;
  key: string;
  description?: string;
  options: DropdownOption[];
  isSystem: boolean;
  isActive: boolean;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

export function useDropdowns(category?: string) {
  const url = category
    ? `/api/content/dropdowns?category=${category}`
    : '/api/content/dropdowns';

  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<{ dropdowns: DropdownCategory[] }>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
    onError: (error) => {
      console.error('Failed to fetch dropdowns:', error);
      // Don't show toast for every error, only on user actions
    }
  });

  return {
    dropdowns: data?.dropdowns || [],
    isLoading,
    error,
    mutate,
    refresh: () => mutate()
  };
}

export function useDropdownOptions(key: string) {
  const { dropdowns, isLoading, error } = useDropdowns();

  const dropdown = dropdowns.find(d => d.key === key);
  const options = dropdown?.options || [];

  // Provide fallback options for critical dropdowns
  const fallbackOptions: Record<string, DropdownOption[]> = {
    incident_severity: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' }
    ],
    incident_type: [
      { value: 'data_breach', label: 'Data Breach' },
      { value: 'malware', label: 'Malware' },
      { value: 'phishing', label: 'Phishing' },
      { value: 'ddos', label: 'DDoS Attack' },
      { value: 'insider_threat', label: 'Insider Threat' },
      { value: 'other', label: 'Other' }
    ],
    asset_type: [
      { value: 'server', label: 'Server' },
      { value: 'workstation', label: 'Workstation' },
      { value: 'network_device', label: 'Network Device' },
      { value: 'application', label: 'Application' },
      { value: 'database', label: 'Database' },
      { value: 'cloud_service', label: 'Cloud Service' }
    ],
    asset_criticality: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' }
    ],
    communication_channel: [
      { value: 'email', label: 'Email' },
      { value: 'slack', label: 'Slack' },
      { value: 'teams', label: 'Microsoft Teams' },
      { value: 'phone', label: 'Phone' },
      { value: 'in_person', label: 'In Person' }
    ]
  };

  // Use fallback if API fails or is loading
  const finalOptions = (error || (isLoading && options.length === 0))
    ? (fallbackOptions[key] || [])
    : options;

  return {
    options: finalOptions,
    isLoading,
    error,
    hasFallback: !!fallbackOptions[key]
  };
}

// Hook for managing dropdown CRUD operations
export function useDropdownManagement() {
  const createDropdown = async (data: {
    name: string;
    key: string;
    description?: string;
    options: DropdownOption[];
  }) => {
    try {
      const response = await fetch('/api/content/dropdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create dropdown');
      }

      const result = await response.json();
      toast.success('Dropdown created successfully');
      return result;
    } catch (error) {
      toast.error('Failed to create dropdown');
      throw error;
    }
  };

  const updateDropdown = async (id: string, data: {
    name?: string;
    description?: string;
    options?: DropdownOption[];
    isActive?: boolean;
  }) => {
    try {
      const response = await fetch(`/api/content/dropdowns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update dropdown');
      }

      const result = await response.json();
      toast.success('Dropdown updated successfully');
      return result;
    } catch (error) {
      toast.error('Failed to update dropdown');
      throw error;
    }
  };

  const deleteDropdown = async (id: string) => {
    try {
      const response = await fetch(`/api/content/dropdowns/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dropdown');
      }

      toast.success('Dropdown deleted successfully');
    } catch (error) {
      toast.error('Failed to delete dropdown');
      throw error;
    }
  };

  return {
    createDropdown,
    updateDropdown,
    deleteDropdown
  };
}