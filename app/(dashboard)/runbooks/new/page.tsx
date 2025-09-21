'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// TODO: Install @hello-pangea/dnd for drag and drop functionality
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Temporary mock components - replace after installing @hello-pangea/dnd
const DragDropContext = ({ children, onDragEnd }: any) => <div>{children}</div>;
const Droppable = ({ children, droppableId }: any) => children({
  droppableProps: {},
  innerRef: () => {},
  placeholder: null
});
const Draggable = ({ children, draggableId, index }: any) => children({
  draggableProps: {},
  dragHandleProps: {},
  innerRef: () => {}
}, false);
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Copy,
  Clock,
  Users,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createRunbook, cloneTemplate } from '@/app/actions/runbooks';
import { toast } from '@/components/ui/toast';

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

export default function NewRunbookPage({
  searchParams,
}: {
  searchParams: { template?: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activePhase, setActivePhase] = useState('detection');
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<RunbookStep | null>(null);

  // Runbook data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState('');
  const [version, setVersion] = useState('1.0');
  const [isTemplate, setIsTemplate] = useState(false);
  const [steps, setSteps] = useState<RunbookStep[]>([]);

  // Step form data
  const [stepForm, setStepForm] = useState<RunbookStep>({
    id: '',
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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update step numbers
    const updatedSteps = items.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
    }));

    setSteps(updatedSteps);
  };

  const addOrUpdateStep = () => {
    if (!stepForm.title || !stepForm.description) {
      toast.error('Please provide step title and description');
      return;
    }

    if (editingStep) {
      // Update existing step
      setSteps(steps.map(step =>
        step.id === editingStep.id ? { ...stepForm, id: editingStep.id } : step
      ));
    } else {
      // Add new step
      const newStep: RunbookStep = {
        ...stepForm,
        id: `step-${Date.now()}`,
        stepNumber: steps.filter(s => s.phase === stepForm.phase).length + 1,
      };
      setSteps([...steps, newStep]);
    }

    // Reset form
    setStepForm({
      id: '',
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
    setEditingStep(null);
    setShowStepDialog(false);
  };

  const editStep = (step: RunbookStep) => {
    setStepForm(step);
    setEditingStep(step);
    setShowStepDialog(true);
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId));
  };

  const handleSubmit = async () => {
    if (!title || steps.length === 0) {
      toast.error('Please provide a title and at least one step');
      return;
    }

    setIsLoading(true);
    try {
      const runbookId = await createRunbook({
        title,
        description,
        classification: classification || undefined,
        version,
        isTemplate,
        steps: steps.map(({ id, ...step }) => step),
      });

      toast.success('Runbook created successfully');
      router.push(`/runbooks/${runbookId}`);
    } catch (error) {
      toast.error('Failed to create runbook');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = async () => {
    if (!searchParams.template) return;

    setIsLoading(true);
    try {
      const templateData = await cloneTemplate(searchParams.template);
      setTitle(templateData.title + ' (Copy)');
      setDescription(templateData.description);
      setClassification(templateData.classification);
      setSteps(templateData.steps);
      toast.success('Template loaded successfully');
    } catch (error) {
      toast.error('Failed to load template');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const phaseSteps = steps.filter(s => s.phase === activePhase);
  const totalDuration = steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
  const criticalSteps = steps.filter(s => s.isCritical).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/runbooks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Runbook</h1>
            <p className="text-muted-foreground">
              Define standardized response procedures
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {searchParams.template && (
            <Button variant="outline" onClick={loadTemplate} disabled={isLoading}>
              <Copy className="mr-2 h-4 w-4" />
              Load Template
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isLoading}>
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
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter runbook title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classification">Classification</Label>
              <Select value={classification} onValueChange={setClassification}>
                <SelectTrigger id="classification">
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_CLASSIFICATIONS.map((cls) => (
                    <SelectItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and scope of this runbook"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="template"
                  checked={isTemplate}
                  onCheckedChange={setIsTemplate}
                />
                <Label htmlFor="template">Save as Template</Label>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{Math.round(totalDuration / 60)}h total</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{steps.length} steps</span>
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
                  {steps.filter(s => s.phase === phase.id).length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {steps.filter(s => s.phase === phase.id).length}
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
                      setStepForm({ ...stepForm, phase: phase.id });
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
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={phase.id}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {phaseSteps.map((step, index) => (
                            <Draggable
                              key={step.id}
                              draggableId={step.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`${
                                    snapshot.isDragging ? 'opacity-50' : ''
                                  }`}
                                >
                                  <StepCard
                                    step={step}
                                    onEdit={editStep}
                                    onDelete={deleteStep}
                                    dragHandleProps={provided.dragHandleProps}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Step Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? 'Edit Step' : 'Add Step'}
            </DialogTitle>
            <DialogDescription>
              Define the details for this runbook step
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="step-title">Title *</Label>
              <Input
                id="step-title"
                value={stepForm.title}
                onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                placeholder="Brief step title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-description">Description *</Label>
              <Textarea
                id="step-description"
                value={stepForm.description}
                onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                placeholder="Detailed instructions for this step"
                rows={4}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="step-role">Responsible Role</Label>
                <Select
                  value={stepForm.responsibleRole}
                  onValueChange={(value) => setStepForm({ ...stepForm, responsibleRole: value })}
                >
                  <SelectTrigger id="step-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-duration">Estimated Duration (minutes)</Label>
                <Input
                  id="step-duration"
                  type="number"
                  value={stepForm.estimatedDuration}
                  onChange={(e) => setStepForm({ ...stepForm, estimatedDuration: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-tools">Tools/Scripts</Label>
              <Textarea
                id="step-tools"
                value={stepForm.tools}
                onChange={(e) => setStepForm({ ...stepForm, tools: e.target.value })}
                placeholder="List any tools, scripts, or commands needed"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-notes">Additional Notes</Label>
              <Textarea
                id="step-notes"
                value={stepForm.notes}
                onChange={(e) => setStepForm({ ...stepForm, notes: e.target.value })}
                placeholder="Any warnings, tips, or additional context"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="step-critical"
                checked={stepForm.isCritical}
                onCheckedChange={(checked) => setStepForm({ ...stepForm, isCritical: checked })}
              />
              <Label htmlFor="step-critical">Mark as Critical Step</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addOrUpdateStep}>
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
  dragHandleProps,
}: {
  step: RunbookStep;
  onEdit: (step: RunbookStep) => void;
  onDelete: (id: string) => void;
  dragHandleProps: any;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div {...dragHandleProps} className="mt-1 cursor-grab">
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
                  Edit
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