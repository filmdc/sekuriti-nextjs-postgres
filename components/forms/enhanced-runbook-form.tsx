'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { EnhancedSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { FormField } from '@/components/ui/form-field';
import { useFormValidation } from '@/hooks/use-form-validation';
import { useAutoSave } from '@/hooks/use-auto-save';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Clock,
  Users,
  AlertTriangle,
  Edit,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import Link from 'next/link';

interface RunbookStep {
  id: string;
  phase: string;
  stepNumber: number;
  title: string;
  description: string;
  responsibleRole: string;
  estimatedDuration: number;
  isCritical: boolean;
  tools?: string;
  notes?: string;
}

interface RunbookFormData {
  title: string;
  description: string;
  classification: string;
  version: string;
  isTemplate: boolean;
  steps: RunbookStep[];
}

const PHASES = [
  { id: 'detection', label: 'Detection', color: 'bg-blue-500', description: 'Identify and validate the incident' },
  { id: 'containment', label: 'Containment', color: 'bg-yellow-500', description: 'Limit the spread and impact' },
  { id: 'eradication', label: 'Eradication', color: 'bg-orange-500', description: 'Remove the threat' },
  { id: 'recovery', label: 'Recovery', color: 'bg-green-500', description: 'Restore normal operations' },
  { id: 'post_incident', label: 'Post-Incident', color: 'bg-purple-500', description: 'Review and improve' },
];

const INCIDENT_CLASSIFICATIONS = [
  { value: 'malware', label: 'Malware' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'data_breach', label: 'Data Breach' },
  { value: 'ddos', label: 'DDoS Attack' },
  { value: 'insider_threat', label: 'Insider Threat' },
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'social_engineering', label: 'Social Engineering' },
  { value: 'supply_chain', label: 'Supply Chain' },
  { value: 'other', label: 'Other' },
];

const ROLES = [
  'Incident Commander',
  'Security Analyst',
  'IT Administrator',
  'Network Engineer',
  'Legal Counsel',
  'Communications Lead',
  'Executive',
];

const initialValues: RunbookFormData = {
  title: '',
  description: '',
  classification: '',
  version: '1.0',
  isTemplate: false,
  steps: [],
};

const validationRules = {
  title: { required: true, min: 5, max: 200 },
  description: { min: 10, max: 1000 },
  version: { required: true, pattern: /^\d+\.\d+$/ },
};

const stepValidationRules = {
  title: { required: true, min: 3, max: 100 },
  description: { required: true, min: 10, max: 500 },
  estimatedDuration: { required: true, min: 1, max: 480 },
};

export interface EnhancedRunbookFormProps {
  onSubmit: (data: RunbookFormData) => Promise<{ id: string } | { error: string }>;
  onAutoSave?: (data: RunbookFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: Partial<RunbookFormData>;
}

export function EnhancedRunbookForm({
  onSubmit,
  onAutoSave,
  isLoading = false,
  mode = 'create',
  initialData,
}: EnhancedRunbookFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePhase, setActivePhase] = useState('detection');
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<RunbookStep | null>(null);

  const formValidation = useFormValidation(
    { ...initialValues, ...initialData },
    validationRules,
    { validateOnChange: true, debounceMs: 300 }
  );

  // Step form data
  const [stepForm, setStepForm] = useState<Omit<RunbookStep, 'id'>>({
    phase: activePhase,
    stepNumber: 1,
    title: '',
    description: '',
    responsibleRole: '',
    estimatedDuration: 30,
    isCritical: false,
    tools: '',
    notes: '',
  });

  const stepFormValidation = useFormValidation(stepForm, stepValidationRules, {
    validateOnChange: true,
    debounceMs: 300
  });

  // Auto-save functionality
  const autoSave = useAutoSave(formValidation.values, {
    delay: 5000, // Longer delay for complex forms
    enabled: !!onAutoSave && mode === 'create',
    onSave: async (data) => {
      if (onAutoSave) {
        await onAutoSave(data);
      }
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
    },
  });

  // Update step form phase when active phase changes
  useEffect(() => {
    if (!editingStep) {
      setStepForm(prev => ({ ...prev, phase: activePhase }));
    }
  }, [activePhase, editingStep]);

  const addOrUpdateStep = useCallback(() => {
    if (!stepFormValidation.isValid) {
      stepFormValidation.validateAllFields();
      return;
    }

    const steps = [...formValidation.values.steps];

    if (editingStep) {
      // Update existing step
      const index = steps.findIndex(s => s.id === editingStep.id);
      if (index !== -1) {
        steps[index] = { ...stepFormValidation.values, id: editingStep.id };
      }
    } else {
      // Add new step
      const newStep: RunbookStep = {
        ...stepFormValidation.values,
        id: `step-${Date.now()}`,
        stepNumber: steps.filter(s => s.phase === stepFormValidation.values.phase).length + 1,
      };
      steps.push(newStep);
    }

    formValidation.handleChange('steps', steps);

    // Reset form
    setStepForm({
      phase: activePhase,
      stepNumber: 1,
      title: '',
      description: '',
      responsibleRole: '',
      estimatedDuration: 30,
      isCritical: false,
      tools: '',
      notes: '',
    });
    stepFormValidation.reset();
    setEditingStep(null);
    setShowStepDialog(false);
  }, [stepFormValidation, formValidation, editingStep, activePhase]);

  const editStep = useCallback((step: RunbookStep) => {
    setStepForm({
      phase: step.phase,
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      responsibleRole: step.responsibleRole,
      estimatedDuration: step.estimatedDuration,
      isCritical: step.isCritical,
      tools: step.tools || '',
      notes: step.notes || '',
    });
    stepFormValidation.reset({
      phase: step.phase,
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      responsibleRole: step.responsibleRole,
      estimatedDuration: step.estimatedDuration,
      isCritical: step.isCritical,
      tools: step.tools || '',
      notes: step.notes || '',
    });
    setEditingStep(step);
    setShowStepDialog(true);
  }, [stepFormValidation]);

  const deleteStep = useCallback((stepId: string) => {
    const steps = formValidation.values.steps.filter(s => s.id !== stepId);
    formValidation.handleChange('steps', steps);
  }, [formValidation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValidation.validateAllFields()) {
      return;
    }

    if (formValidation.values.steps.length === 0) {
      formValidation.setError('title', 'Please add at least one step to the runbook');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(formValidation.values);

      if ('error' in result) {
        formValidation.setError('title', result.error);
      } else {
        router.push(`/runbooks/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to submit runbook:', error);
      formValidation.setError('title', 'Failed to save runbook. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const phaseSteps = formValidation.values.steps.filter(s => s.phase === activePhase);
  const totalDuration = formValidation.values.steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
  const criticalSteps = formValidation.values.steps.filter(s => s.isCritical).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/runbooks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === 'create' ? 'Create Runbook' : 'Edit Runbook'}
            </h1>
            <p className="text-muted-foreground">
              Define standardized response procedures
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

        <div className="flex gap-2">
          {autoSave.lastSaved && (
            <span className="text-sm text-muted-foreground">
              Last saved: {autoSave.lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Runbook
          </Button>
        </div>
      </div>

      {/* Runbook Details */}
      <Card>
        <CardHeader>
          <CardTitle>Runbook Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Title"
              required
              tooltip="Clear, descriptive title for this runbook"
              error={formValidation.getFieldProps('title').error}
            >
              <EnhancedInput
                placeholder="Enter runbook title"
                autoFocus
                showValidation
                {...formValidation.getFieldProps('title')}
                onChange={(e) => formValidation.handleChange('title', e.target.value)}
              />
            </FormField>

            <FormField
              label="Classification"
              optional
              tooltip="Type of incident this runbook addresses"
              error={formValidation.getFieldProps('classification').error}
            >
              <EnhancedSelect
                placeholder="Select classification"
                searchable
                value={formValidation.values.classification}
                onValueChange={(value) => formValidation.handleChange('classification', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_CLASSIFICATIONS.map((cls) => (
                    <SelectItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </EnhancedSelect>
            </FormField>
          </div>

          <FormField
            label="Description"
            optional
            tooltip="Describe the purpose and scope of this runbook"
            error={formValidation.getFieldProps('description').error}
          >
            <EnhancedTextarea
              placeholder="Describe the purpose and scope of this runbook"
              autoResize
              minRows={3}
              showCharacterCount
              maxCharacters={1000}
              autoSave={mode === 'create'}
              onAutoSave={async (content) => {
                formValidation.handleChange('description', content);
              }}
              {...formValidation.getFieldProps('description')}
              onChange={(e) => formValidation.handleChange('description', e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FormField
                label="Version"
                required
                tooltip="Version number in format X.Y"
                error={formValidation.getFieldProps('version').error}
              >
                <EnhancedInput
                  placeholder="1.0"
                  formatExample="1.0, 2.1, 3.0"
                  className="w-24"
                  {...formValidation.getFieldProps('version')}
                  onChange={(e) => formValidation.handleChange('version', e.target.value)}
                />
              </FormField>

              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formValidation.values.isTemplate}
                  onCheckedChange={(checked) => formValidation.handleChange('isTemplate', checked)}
                />
                <FormField
                  label="Save as Template"
                  tooltip="Make this runbook available as a template for others"
                >
                  <></>
                </FormField>
              </div>
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{Math.round(totalDuration / 60)}h total</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{formValidation.values.steps.length} steps</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span>{criticalSteps} critical</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Response Phases</CardTitle>
          <CardDescription>
            Organize response steps by incident phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activePhase} onValueChange={setActivePhase}>
            <TabsList className="grid w-full grid-cols-5">
              {PHASES.map((phase) => (
                <TabsTrigger key={phase.id} value={phase.id} className="relative">
                  <span>{phase.label}</span>
                  {formValidation.values.steps.filter(s => s.phase === phase.id).length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {formValidation.values.steps.filter(s => s.phase === phase.id).length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {PHASES.map((phase) => (
              <TabsContent key={phase.id} value={phase.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {phase.description}
                  </p>
                  <Button
                    onClick={() => {
                      setStepForm(prev => ({ ...prev, phase: phase.id }));
                      setShowStepDialog(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Step
                  </Button>
                </div>

                {phaseSteps.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground">
                        No steps defined for this phase
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {phaseSteps.map((step) => (
                      <StepCard
                        key={step.id}
                        step={step}
                        onEdit={editStep}
                        onDelete={deleteStep}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Step Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? 'Edit Step' : 'Add Step'}
            </DialogTitle>
            <DialogDescription>
              Define the details for this runbook step
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <FormField
              label="Step Title"
              required
              error={stepFormValidation.getFieldProps('title').error}
            >
              <EnhancedInput
                placeholder="Brief step title"
                showValidation
                {...stepFormValidation.getFieldProps('title')}
                onChange={(e) => {
                  setStepForm(prev => ({ ...prev, title: e.target.value }));
                  stepFormValidation.handleChange('title', e.target.value);
                }}
              />
            </FormField>

            <FormField
              label="Description"
              required
              error={stepFormValidation.getFieldProps('description').error}
            >
              <EnhancedTextarea
                placeholder="Detailed instructions for this step"
                autoResize
                minRows={4}
                showCharacterCount
                maxCharacters={500}
                {...stepFormValidation.getFieldProps('description')}
                onChange={(e) => {
                  setStepForm(prev => ({ ...prev, description: e.target.value }));
                  stepFormValidation.handleChange('description', e.target.value);
                }}
              />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Responsible Role"
                optional
              >
                <EnhancedSelect
                  placeholder="Select role"
                  searchable
                  value={stepForm.responsibleRole}
                  onValueChange={(value) => {
                    setStepForm(prev => ({ ...prev, responsibleRole: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </EnhancedSelect>
              </FormField>

              <FormField
                label="Estimated Duration (minutes)"
                required
                error={stepFormValidation.getFieldProps('estimatedDuration').error}
              >
                <EnhancedInput
                  type="number"
                  min="1"
                  max="480"
                  showValidation
                  value={stepForm.estimatedDuration.toString()}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setStepForm(prev => ({ ...prev, estimatedDuration: value }));
                    stepFormValidation.handleChange('estimatedDuration', value);
                  }}
                />
              </FormField>
            </div>

            <FormField
              label="Tools/Scripts"
              optional
            >
              <EnhancedTextarea
                placeholder="List any tools, scripts, or commands needed"
                autoResize
                minRows={2}
                value={stepForm.tools}
                onChange={(e) => setStepForm(prev => ({ ...prev, tools: e.target.value }))}
              />
            </FormField>

            <FormField
              label="Additional Notes"
              optional
            >
              <EnhancedTextarea
                placeholder="Any warnings, tips, or additional context"
                autoResize
                minRows={2}
                value={stepForm.notes}
                onChange={(e) => setStepForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </FormField>

            <div className="flex items-center gap-2">
              <Switch
                checked={stepForm.isCritical}
                onCheckedChange={(checked) => setStepForm(prev => ({ ...prev, isCritical: checked }))}
              />
              <FormField
                label="Mark as Critical Step"
                tooltip="Critical steps require special attention during execution"
              >
                <></>
              </FormField>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={addOrUpdateStep}
              disabled={!stepFormValidation.isValid}
            >
              {editingStep ? 'Update' : 'Add'} Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StepCard({
  step,
  onEdit,
  onDelete,
}: {
  step: RunbookStep;
  onEdit: (step: RunbookStep) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 cursor-grab">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {step.stepNumber}
                  </span>
                  {step.isCritical && (
                    <Badge variant="destructive" className="text-xs">
                      Critical
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold">{step.title}</h4>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(step)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(step.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {step.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {step.responsibleRole && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{step.responsibleRole}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{step.estimatedDuration} min</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}