/**
 * Global form configuration and validation utilities
 * Provides consistent form behavior across the application
 */

export interface FormConfig {
  autoSave: {
    enabled: boolean;
    delay: number;
    saveOnUnmount: boolean;
  };
  validation: {
    validateOnChange: boolean;
    validateOnBlur: boolean;
    debounceMs: number;
    showRealTimeValidation: boolean;
  };
  ui: {
    showCharacterCount: boolean;
    showProgressIndicators: boolean;
    enableAutoResize: boolean;
    confirmDiscardChanges: boolean;
  };
}

// Default form configuration
export const DEFAULT_FORM_CONFIG: FormConfig = {
  autoSave: {
    enabled: true,
    delay: 3000, // 3 seconds
    saveOnUnmount: true,
  },
  validation: {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
    showRealTimeValidation: true,
  },
  ui: {
    showCharacterCount: true,
    showProgressIndicators: true,
    enableAutoResize: true,
    confirmDiscardChanges: true,
  },
};

// Form-specific configurations
export const FORM_CONFIGS: Record<string, Partial<FormConfig>> = {
  incident: {
    autoSave: {
      enabled: true,
      delay: 2000, // Faster auto-save for critical forms
    },
    validation: {
      debounceMs: 200, // Faster validation feedback
    },
  },
  runbook: {
    autoSave: {
      enabled: true,
      delay: 5000, // Longer delay for complex forms
    },
  },
  communication: {
    autoSave: {
      enabled: true,
      delay: 3000,
    },
    validation: {
      debounceMs: 500, // Allow more typing before validation
    },
  },
  asset: {
    autoSave: {
      enabled: false, // Disable auto-save for asset forms
    },
  },
  settings: {
    autoSave: {
      enabled: false, // Settings should be saved manually
    },
    ui: {
      confirmDiscardChanges: false, // Less critical changes
    },
  },
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  version: /^\d+\.\d+(?:\.\d+)?$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// Common validation rules
export const COMMON_VALIDATION_RULES = {
  title: {
    required: true,
    min: 3,
    max: 200,
  },
  description: {
    max: 2000,
  },
  email: {
    email: true,
    max: 255,
  },
  phone: {
    phone: true,
    max: 20,
  },
  url: {
    url: true,
    max: 500,
  },
  password: {
    required: true,
    strongPassword: true,
  },
  name: {
    required: true,
    min: 2,
    max: 100,
  },
};

// Field-specific configurations
export const FIELD_CONFIGS = {
  title: {
    placeholder: 'Enter a descriptive title...',
    helpText: 'Keep it concise but descriptive',
    autoFocus: true,
  },
  description: {
    placeholder: 'Provide detailed information...',
    minRows: 3,
    maxRows: 8,
    autoResize: true,
  },
  email: {
    placeholder: 'user@example.com',
    formatExample: 'user@domain.com',
    type: 'email' as const,
  },
  phone: {
    placeholder: '+1 234 567 8900',
    formatExample: '+1-234-567-8900',
    type: 'tel' as const,
  },
  url: {
    placeholder: 'https://example.com',
    formatExample: 'https://domain.com/path',
    type: 'url' as const,
  },
  password: {
    type: 'password' as const,
    showPasswordToggle: true,
  },
};

// Get form configuration for a specific form type
export function getFormConfig(formType: string): FormConfig {
  const baseConfig = { ...DEFAULT_FORM_CONFIG };
  const formSpecificConfig = FORM_CONFIGS[formType] || {};

  return {
    autoSave: { ...baseConfig.autoSave, ...formSpecificConfig.autoSave },
    validation: { ...baseConfig.validation, ...formSpecificConfig.validation },
    ui: { ...baseConfig.ui, ...formSpecificConfig.ui },
  };
}

// Severity levels for form feedback
export const SEVERITY_LEVELS = {
  low: {
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  medium: {
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  high: {
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
  },
  critical: {
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
};

// Priority levels for form elements
export const PRIORITY_LEVELS = {
  required: {
    label: 'Required',
    color: 'red',
    description: 'This field is required',
  },
  important: {
    label: 'Important',
    color: 'orange',
    description: 'This field is highly recommended',
  },
  optional: {
    label: 'Optional',
    color: 'gray',
    description: 'This field is optional',
  },
};

// Form field types with their default configurations
export const FIELD_TYPES = {
  text: {
    component: 'EnhancedInput',
    validation: ['required', 'min', 'max', 'pattern'],
  },
  email: {
    component: 'EnhancedInput',
    validation: ['required', 'email'],
    props: { type: 'email' },
  },
  password: {
    component: 'EnhancedInput',
    validation: ['required', 'strongPassword'],
    props: { type: 'password', showPasswordToggle: true },
  },
  textarea: {
    component: 'EnhancedTextarea',
    validation: ['required', 'min', 'max'],
    props: { autoResize: true },
  },
  select: {
    component: 'EnhancedSelect',
    validation: ['required'],
    props: { searchable: true },
  },
  number: {
    component: 'EnhancedInput',
    validation: ['required', 'min', 'max'],
    props: { type: 'number' },
  },
  url: {
    component: 'EnhancedInput',
    validation: ['required', 'url'],
    props: { type: 'url' },
  },
  phone: {
    component: 'EnhancedInput',
    validation: ['required', 'phone'],
    props: { type: 'tel' },
  },
} as const;

// Auto-save strategies
export const AUTO_SAVE_STRATEGIES = {
  aggressive: {
    delay: 1000,
    saveOnChange: true,
    saveOnBlur: true,
    saveOnUnmount: true,
  },
  normal: {
    delay: 3000,
    saveOnChange: false,
    saveOnBlur: true,
    saveOnUnmount: true,
  },
  conservative: {
    delay: 10000,
    saveOnChange: false,
    saveOnBlur: false,
    saveOnUnmount: true,
  },
  disabled: {
    delay: 0,
    saveOnChange: false,
    saveOnBlur: false,
    saveOnUnmount: false,
  },
};

// Form submission states
export const SUBMISSION_STATES = {
  idle: {
    label: 'Save',
    disabled: false,
    loading: false,
  },
  validating: {
    label: 'Validating...',
    disabled: true,
    loading: true,
  },
  submitting: {
    label: 'Saving...',
    disabled: true,
    loading: true,
  },
  success: {
    label: 'Saved',
    disabled: false,
    loading: false,
  },
  error: {
    label: 'Retry',
    disabled: false,
    loading: false,
  },
};

// Utility function to get field configuration
export function getFieldConfig(fieldName: string, fieldType: keyof typeof FIELD_TYPES) {
  const typeConfig = FIELD_TYPES[fieldType];
  const nameConfig = FIELD_CONFIGS[fieldName as keyof typeof FIELD_CONFIGS] || {};

  return {
    ...typeConfig,
    props: {
      ...typeConfig.props,
      ...nameConfig,
    },
  };
}