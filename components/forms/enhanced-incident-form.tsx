'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { EnhancedSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { FormField } from '@/components/ui/form-field';
import { useFormValidation } from '@/hooks/use-form-validation';
import { useAutoSave } from '@/hooks/use-auto-save';
import { AlertTriangle, ArrowLeft, Save, Clock, Shield, Users } from 'lucide-react';
import Link from 'next/link';

interface IncidentFormData {
  title: string;
  description: string;
  classification: string;
  severity: string;
  detectionDetails: string;
  reportedBy: string;
  affectedSystems: string;
  initialResponse: string;
}

const classificationOptions = [
  { value: 'malware', label: 'Malware', description: 'Malicious software detected' },
  { value: 'phishing', label: 'Phishing', description: 'Social engineering attack' },
  { value: 'data_breach', label: 'Data Breach', description: 'Unauthorized data access' },
  { value: 'ddos', label: 'DDoS Attack', description: 'Distributed denial of service' },
  { value: 'insider_threat', label: 'Insider Threat', description: 'Internal security threat' },
  { value: 'ransomware', label: 'Ransomware', description: 'Data encryption attack' },
  { value: 'social_engineering', label: 'Social Engineering', description: 'Human manipulation attack' },
  { value: 'supply_chain', label: 'Supply Chain', description: 'Third-party compromise' },
  { value: 'other', label: 'Other', description: 'Other security incident' },
];

const severityOptions = [
  { value: 'low', label: 'Low', description: 'Minimal impact, no immediate action required' },
  { value: 'medium', label: 'Medium', description: 'Moderate impact, response within hours' },
  { value: 'high', label: 'High', description: 'Significant impact, immediate response needed' },
  { value: 'critical', label: 'Critical', description: 'Severe impact, emergency response required' },
];

const initialValues: IncidentFormData = {
  title: '',
  description: '',
  classification: '',
  severity: 'medium',
  detectionDetails: '',
  reportedBy: '',
  affectedSystems: '',
  initialResponse: '',
};

const validationRules = {
  title: { required: true, min: 5, max: 200 },
  description: { required: true, min: 20, max: 2000 },
  classification: { required: true },
  severity: { required: true },
  detectionDetails: { min: 10, max: 1000 },
  reportedBy: { max: 100 },
  affectedSystems: { max: 500 },
  initialResponse: { max: 1000 },
};

export interface EnhancedIncidentFormProps {
  onSubmit: (data: IncidentFormData) => Promise<{ id: string } | { error: string }>;
  onAutoSave?: (data: IncidentFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: Partial<IncidentFormData>;
}

export function EnhancedIncidentForm({
  onSubmit,
  onAutoSave,
  isLoading = false,
  mode = 'create',
  initialData,
}: EnhancedIncidentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValidation = useFormValidation(
    { ...initialValues, ...initialData },
    validationRules,
    { validateOnChange: true, debounceMs: 300 }
  );

  // Auto-save functionality
  const autoSave = useAutoSave(formValidation.values, {
    delay: 3000,
    enabled: !!onAutoSave && mode === 'create',
    onSave: async (data) => {
      if (onAutoSave) {
        await onAutoSave(data);
      }
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
    },
    ignoreFields: ['initialResponse'], // Don't auto-save response notes
  });

  // Email validation for reportedBy field
  const validateReportedBy = useCallback(async (value: string) => {
    if (!value) return null;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }

    // Simulate async validation (checking if user exists)
    return new Promise<string | null>((resolve) => {
      setTimeout(() => {
        // Mock validation - in real app, check against user database
        if (value.includes('external')) {
          resolve('External email addresses are not allowed');
        } else {
          resolve(null);
        }
      }, 500);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValidation.validateAllFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(formValidation.values);

      if ('error' in result) {
        // Handle server-side validation errors
        const errorField = Object.keys(validationRules)[0]; // Default to first field
        formValidation.setError(errorField, result.error);
      } else {
        // Success - redirect to incident view
        router.push(`/incidents/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to submit incident:', error);
      formValidation.setError('title', 'Failed to create incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/incidents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              {mode === 'create' ? 'Record New Incident' : 'Edit Incident'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === 'create'
                ? 'Document a security incident for tracking and response'
                : 'Update incident details and progress'
              }
            </p>

            {/* Auto-save indicator */}
            {autoSave.hasUnsavedChanges && (
              <div className="flex items-center gap-2 mt-2">
                {autoSave.isSaving ? (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 animate-pulse" />
                    Saving draft...
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <Save className="h-3 w-3" />
                    Unsaved changes
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {autoSave.lastSaved && (
            <span className="text-sm text-muted-foreground">
              Draft saved: {autoSave.lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                label="Incident Title"
                required
                tooltip="Brief, descriptive title that clearly identifies the incident"
                error={formValidation.getFieldProps('title').error}
              >
                <EnhancedInput
                  placeholder="e.g., Suspicious login attempts from unknown IPs"
                  autoFocus
                  showValidation
                  {...formValidation.getFieldProps('title')}
                  onChange={(e) => formValidation.handleChange('title', e.target.value)}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Classification"
                  required
                  tooltip="Select the type of security incident"
                  error={formValidation.getFieldProps('classification').error}
                >
                  <EnhancedSelect
                    placeholder="Select incident type"
                    searchable
                    value={formValidation.values.classification}
                    onValueChange={(value) => formValidation.handleChange('classification', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classificationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} description={option.description}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </EnhancedSelect>
                </FormField>

                <FormField
                  label="Severity Level"
                  required
                  tooltip="Assess the potential impact and urgency of response needed"
                  error={formValidation.getFieldProps('severity').error}
                >
                  <EnhancedSelect
                    value={formValidation.values.severity}
                    onValueChange={(value) => formValidation.handleChange('severity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} description={option.description}>
                          <span className={getSeverityColor(option.value)}>
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </EnhancedSelect>
                </FormField>
              </div>

              <FormField
                label="Incident Description"
                required
                tooltip="Detailed description of what happened, when, and the current situation"
                error={formValidation.getFieldProps('description').error}
              >
                <EnhancedTextarea
                  placeholder="Provide a comprehensive description of the security incident including timeline, affected systems, and observed behavior..."
                  autoResize
                  minRows={4}
                  maxRows={8}
                  showCharacterCount
                  minCharacters={20}
                  maxCharacters={2000}
                  autoSave={mode === 'create'}
                  onAutoSave={async (content) => {
                    formValidation.handleChange('description', content);
                  }}
                  {...formValidation.getFieldProps('description')}
                  onChange={(e) => formValidation.handleChange('description', e.target.value)}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Detection and Reporting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Detection & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                label="How was this incident detected?"
                optional
                tooltip="Describe the method or system that first identified this incident"
                error={formValidation.getFieldProps('detectionDetails').error}
              >
                <EnhancedTextarea
                  placeholder="e.g., Automated security monitoring alert, user report, routine audit, external notification..."
                  autoResize
                  minRows={3}
                  showCharacterCount
                  maxCharacters={1000}
                  {...formValidation.getFieldProps('detectionDetails')}
                  onChange={(e) => formValidation.handleChange('detectionDetails', e.target.value)}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Reported By"
                  optional
                  tooltip="Email address of the person who reported this incident"
                  error={formValidation.getFieldProps('reportedBy').error}
                >
                  <EnhancedInput
                    type="email"
                    placeholder="reporter@company.com"
                    formatExample="user@domain.com"
                    showValidation
                    onValidate={validateReportedBy}
                    {...formValidation.getFieldProps('reportedBy')}
                    onChange={(e) => formValidation.handleChange('reportedBy', e.target.value)}
                  />
                </FormField>

                <FormField
                  label="Affected Systems"
                  optional
                  tooltip="List of systems, applications, or infrastructure components affected"
                  error={formValidation.getFieldProps('affectedSystems').error}
                >
                  <EnhancedInput
                    placeholder="e.g., Web server, user workstations, database"
                    showCharacterCount
                    maxCharacters={500}
                    {...formValidation.getFieldProps('affectedSystems')}
                    onChange={(e) => formValidation.handleChange('affectedSystems', e.target.value)}
                  />
                </FormField>
              </div>

              <FormField
                label="Initial Response Actions"
                optional
                tooltip="Document any immediate steps taken to address the incident"
                error={formValidation.getFieldProps('initialResponse').error}
              >
                <EnhancedTextarea
                  placeholder="Describe any immediate containment actions, notifications sent, or systems isolated..."
                  autoResize
                  minRows={3}
                  showCharacterCount
                  maxCharacters={1000}
                  {...formValidation.getFieldProps('initialResponse')}
                  onChange={(e) => formValidation.handleChange('initialResponse', e.target.value)}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" asChild>
              <Link href="/incidents">Cancel</Link>
            </Button>

            <div className="flex items-center gap-2">
              {formValidation.isDirty && !formValidation.isValid && (
                <span className="text-sm text-muted-foreground">
                  Please fix validation errors before submitting
                </span>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !formValidation.isValid || isLoading}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {mode === 'create' ? 'Create Incident' : 'Update Incident'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}