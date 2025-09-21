'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { EnhancedSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { FormField } from '@/components/ui/form-field';
import { useFormValidation } from '@/hooks/use-form-validation';
import { useAutoSave } from '@/hooks/use-auto-save';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  X,
  Plus,
  Info,
  Users,
  Mail,
  Shield,
  Megaphone,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface CommunicationFormData {
  title: string;
  category: string;
  subject: string;
  content: string;
  tags: string[];
  isDefault: boolean;
}

const TEMPLATE_CATEGORIES = [
  { value: 'internal', label: 'Internal', icon: Users, description: 'Communications for internal team members' },
  { value: 'customer', label: 'Customer', icon: Mail, description: 'External customer notifications' },
  { value: 'regulatory', label: 'Regulatory', icon: Shield, description: 'Compliance and regulatory reporting' },
  { value: 'media', label: 'Media', icon: Megaphone, description: 'Public relations and media statements' },
];

const AVAILABLE_VARIABLES = {
  incident: [
    { key: 'incident.title', label: 'Incident Title', example: 'Data Breach Investigation' },
    { key: 'incident.severity', label: 'Severity Level', example: 'Critical' },
    { key: 'incident.status', label: 'Current Status', example: 'Contained' },
    { key: 'incident.detectedAt', label: 'Detection Time', example: '2024-01-20 14:30 UTC' },
    { key: 'incident.description', label: 'Incident Description', example: 'Unauthorized access detected' },
  ],
  organization: [
    { key: 'organization.name', label: 'Organization Name', example: 'Acme Corporation' },
    { key: 'organization.contact', label: 'Security Contact Email', example: 'security@acme.com' },
    { key: 'organization.phone', label: 'Contact Phone', example: '+1-555-0100' },
    { key: 'organization.website', label: 'Company Website', example: 'https://acme.com' },
  ],
  user: [
    { key: 'user.name', label: 'Current User Name', example: 'John Doe' },
    { key: 'user.email', label: 'User Email', example: 'john.doe@acme.com' },
    { key: 'user.role', label: 'User Role/Title', example: 'Senior Security Analyst' },
    { key: 'user.signature', label: 'Email Signature', example: 'Best regards,\nJohn Doe' },
  ],
  datetime: [
    { key: 'datetime.current', label: 'Current Date & Time', example: '2024-01-20 15:45 UTC' },
    { key: 'datetime.date', label: 'Current Date', example: '2024-01-20' },
    { key: 'datetime.time', label: 'Current Time', example: '15:45 UTC' },
  ],
};

const initialValues: CommunicationFormData = {
  title: '',
  category: '',
  subject: '',
  content: '',
  tags: [],
  isDefault: false,
};

const validationRules = {
  title: { required: true, min: 5, max: 200 },
  category: { required: true },
  content: { required: true, min: 50, max: 10000 },
  subject: { max: 200 },
};

export interface EnhancedCommunicationFormProps {
  onSubmit: (data: CommunicationFormData) => Promise<{ id: string } | { error: string }>;
  onAutoSave?: (data: CommunicationFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: Partial<CommunicationFormData>;
}

export function EnhancedCommunicationForm({
  onSubmit,
  onAutoSave,
  isLoading = false,
  mode = 'create',
  initialData,
}: EnhancedCommunicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [newTag, setNewTag] = useState('');

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
    ignoreFields: ['subject'], // Don't auto-save subject as it changes frequently
  });

  // Validate template content for variables
  const validateContent = useCallback(async (content: string) => {
    if (!content) return null;

    // Check for unclosed variable braces
    const openBraces = (content.match(/\{\{/g) || []).length;
    const closeBraces = (content.match(/\}\}/g) || []).length;

    if (openBraces !== closeBraces) {
      return 'Unclosed variable braces detected. Make sure all {{variables}} are properly closed.';
    }

    // Check for invalid variable names
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const matches = content.matchAll(variablePattern);
    const allVariables = Object.values(AVAILABLE_VARIABLES).flat().map(v => v.key);

    for (const match of matches) {
      const variableName = match[1].trim();
      if (!allVariables.includes(variableName)) {
        return `Unknown variable: {{${variableName}}}. Check the variable picker for available options.`;
      }
    }

    return null;
  }, []);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !formValidation.values.tags.includes(newTag.trim())) {
      const newTags = [...formValidation.values.tags, newTag.trim()];
      formValidation.handleChange('tags', newTags);
      setNewTag('');
    }
  }, [newTag, formValidation]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const newTags = formValidation.values.tags.filter(tag => tag !== tagToRemove);
    formValidation.handleChange('tags', newTags);
  }, [formValidation]);

  const insertVariable = useCallback((variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formValidation.values.content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newContent = before + `{{${variable}}}` + after;

      formValidation.handleChange('content', newContent);

      // Set cursor position after the inserted variable
      setTimeout(() => {
        const newCursorPos = start + variable.length + 4;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 10);
    }
  }, [formValidation]);

  const loadSampleTemplate = useCallback(() => {
    const sampleTemplate = `## Security Incident Notification

Dear {{customer.name}},

We are writing to inform you about a **{{incident.severity}}** security incident: **{{incident.title}}**.

### Incident Details
- **Type:** {{incident.type}}
- **Status:** {{incident.status}}
- **Detected:** {{incident.detectedAt}}

### Description
{{incident.description}}

### Our Response
We detected this incident at {{incident.detectedAt}} and have taken immediate action to contain it. Our security team has implemented additional protective measures.

### Contact Information
If you have any questions or concerns:
- **Email:** {{organization.contact}}
- **Phone:** {{organization.phone}}

We sincerely apologize for any inconvenience.

{{user.signature}}

---
**{{organization.name}}**
*Report generated on {{datetime.date}}*`;

    formValidation.handleChange('content', sampleTemplate);
    formValidation.handleChange('subject', 'Security Incident Notification - {{incident.title}}');
    formValidation.handleChange('title', 'Security Incident Customer Notification');
    formValidation.handleChange('category', 'customer');
  }, [formValidation]);

  const renderPreview = useCallback(() => {
    let previewContent = formValidation.values.content;
    let previewSubject = formValidation.values.subject;

    // Replace variables with example values
    Object.values(AVAILABLE_VARIABLES).flat().forEach(variable => {
      const regex = new RegExp(`\\{\\{${variable.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      previewContent = previewContent.replace(regex, variable.example);
      previewSubject = previewSubject.replace(regex, variable.example);
    });

    return { content: previewContent, subject: previewSubject };
  }, [formValidation.values.content, formValidation.values.subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValidation.validateAllFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(formValidation.values);

      if ('error' in result) {
        formValidation.setError('title', result.error);
      } else {
        router.push(`/communications/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to submit template:', error);
      formValidation.setError('title', 'Failed to save template. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formValidation.isDirty || autoSave.hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      router.push('/communications');
    }
  };

  const preview = renderPreview();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === 'create' ? 'Create Communication Template' : 'Edit Communication Template'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create a reusable template for incident communications
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formValidation.isValid || isSubmitting || isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Template Details */}
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Basic information about your communication template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Template Name"
                required
                tooltip="Descriptive name to identify this template"
                error={formValidation.getFieldProps('title').error}
              >
                <EnhancedInput
                  placeholder="e.g., Customer Breach Notification"
                  autoFocus
                  showValidation
                  {...formValidation.getFieldProps('title')}
                  onChange={(e) => formValidation.handleChange('title', e.target.value)}
                />
              </FormField>

              <FormField
                label="Category"
                required
                tooltip="Select the type of communication this template is for"
                error={formValidation.getFieldProps('category').error}
              >
                <EnhancedSelect
                  placeholder="Select a category"
                  value={formValidation.values.category}
                  onValueChange={(value) => formValidation.handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} description={cat.description}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </EnhancedSelect>
              </FormField>

              <FormField
                label="Email Subject"
                optional
                tooltip="Subject line for email templates. Supports variables."
                error={formValidation.getFieldProps('subject').error}
              >
                <EnhancedInput
                  placeholder="e.g., Important Security Update - {{organization.name}}"
                  helperText="Use for email templates. Supports variables."
                  showValidation
                  {...formValidation.getFieldProps('subject')}
                  onChange={(e) => formValidation.handleChange('subject', e.target.value)}
                />
              </FormField>

              <FormField
                label="Tags"
                optional
                tooltip="Add tags to categorize and organize templates"
              >
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <EnhancedInput
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formValidation.values.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormField>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <FormField
                    label="System Default Template"
                    tooltip="Make this a default template for all organizations"
                  >
                    <></>
                  </FormField>
                  <p className="text-xs text-muted-foreground">
                    Make this a default template for all organizations
                  </p>
                </div>
                <Switch
                  checked={formValidation.values.isDefault}
                  onCheckedChange={(checked) => formValidation.handleChange('isDefault', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Content */}
          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
              <CardDescription>
                Write your template content with support for variables and markdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">
                    <Code className="mr-2 h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-4">
                  <FormField
                    label="Template Content"
                    required
                    tooltip="Use {{variable}} syntax for dynamic content. Type {{ to see available variables."
                    error={formValidation.getFieldProps('content').error}
                  >
                    <EnhancedTextarea
                      id="template-content"
                      placeholder="Write your template content here. Use {{variable}} syntax for dynamic content..."
                      autoResize
                      minRows={12}
                      maxRows={20}
                      showCharacterCount
                      minCharacters={50}
                      maxCharacters={10000}
                      showValidation
                      onValidate={validateContent}
                      autoSave={mode === 'create'}
                      onAutoSave={async (content) => {
                        formValidation.handleChange('content', content);
                      }}
                      {...formValidation.getFieldProps('content')}
                      onChange={(e) => formValidation.handleChange('content', e.target.value)}
                    />
                  </FormField>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="space-y-4">
                    {formValidation.values.subject && (
                      <div>
                        <h4 className="font-medium mb-2">Email Subject:</h4>
                        <div className="p-3 bg-muted rounded-md">
                          {preview.subject || 'No subject defined'}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium mb-2">Content Preview:</h4>
                      <div className="p-4 bg-muted rounded-md min-h-[300px] whitespace-pre-wrap">
                        {preview.content || 'No content defined'}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variable Picker */}
          <Card>
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
              <CardDescription>
                Click to insert variables into your template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(AVAILABLE_VARIABLES).map(([category, variables]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm capitalize">{category}</h4>
                  <div className="space-y-1">
                    {variables.map((variable) => (
                      <Button
                        key={variable.key}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => insertVariable(variable.key)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-mono text-muted-foreground">
                            {`{{${variable.key}}}`}
                          </span>
                          <span className="text-sm">{variable.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {variable.example}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Smart Variables</p>
                  <p className="text-muted-foreground">
                    Type {'{{'} to see available variables, or click them from the list
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Auto-Save</p>
                  <p className="text-muted-foreground">
                    Your changes are automatically saved every few seconds
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={loadSampleTemplate}
              >
                Load Sample Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push('/communications')}
              className="bg-destructive text-destructive-foreground"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}