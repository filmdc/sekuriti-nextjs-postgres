'use client';

import { useState, useCallback, useRef } from 'react';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  strongPassword?: boolean;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules,
  options: FormValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateStrongPassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
    return null;
  };

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.min && value.length < rule.min) {
        return `Must be at least ${rule.min} characters`;
      }
      if (rule.max && value.length > rule.max) {
        return `Must be no more than ${rule.max} characters`;
      }
    }

    // Number range validations
    if (typeof value === 'number') {
      if (rule.min && value < rule.min) {
        return `Must be at least ${rule.min}`;
      }
      if (rule.max && value > rule.max) {
        return `Must be no more than ${rule.max}`;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return 'Invalid format';
    }

    // Email validation
    if (rule.email && typeof value === 'string' && !validateEmail(value)) {
      return 'Please enter a valid email address';
    }

    // URL validation
    if (rule.url && typeof value === 'string' && !validateUrl(value)) {
      return 'Please enter a valid URL';
    }

    // Phone validation
    if (rule.phone && typeof value === 'string' && !validatePhone(value)) {
      return 'Please enter a valid phone number';
    }

    // Strong password validation
    if (rule.strongPassword && typeof value === 'string') {
      return validateStrongPassword(value);
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [validationRules]);

  const validateAllFields = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  const validateSingleField = useCallback(async (name: string, value: any) => {
    if (timeoutRefs.current[name]) {
      clearTimeout(timeoutRefs.current[name]);
    }

    setIsValidating(prev => ({ ...prev, [name]: true }));

    return new Promise<string | null>((resolve) => {
      timeoutRefs.current[name] = setTimeout(() => {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error || '' }));
        setIsValidating(prev => ({ ...prev, [name]: false }));
        resolve(error);
      }, debounceMs);
    });
  }, [validateField, debounceMs]);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    if (validateOnChange && touched[name]) {
      validateSingleField(name, value);
    }
  }, [validateOnChange, touched, validateSingleField]);

  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearError = useCallback((name: string) => {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validateOnBlur) {
      validateSingleField(name, values[name]);
    }
  }, [validateOnBlur, values, validateSingleField]);

  const handleChange = useCallback((name: string, value: any) => {
    setValue(name, value);
  }, [setValue]);

  const reset = useCallback((newValues?: Partial<T>) => {
    setValues(newValues ? { ...initialValues, ...newValues } : initialValues);
    setErrors({});
    setTouched({});
    setIsValidating({});

    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    timeoutRefs.current = {};
  }, [initialValues]);

  const getFieldProps = useCallback((name: string) => ({
    value: values[name] || '',
    error: touched[name] ? errors[name] : '',
    onChange: (value: any) => handleChange(name, value),
    onBlur: () => handleBlur(name),
    isValidating: isValidating[name] || false,
  }), [values, errors, touched, isValidating, handleChange, handleBlur]);

  const isValid = Object.keys(errors).every(key => !errors[key]);
  const isDirty = Object.keys(values).some(key => values[key] !== initialValues[key]);

  return {
    values,
    errors,
    touched,
    isValidating,
    isValid,
    isDirty,
    setValue,
    setError,
    clearError,
    handleChange,
    handleBlur,
    validateField: validateSingleField,
    validateAllFields,
    getFieldProps,
    reset,
  };
}