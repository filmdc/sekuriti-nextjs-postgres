'use client';

import { useState, useEffect } from 'react';
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
  History,
  Clock,
  Users,
  AlertTriangle,
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
import { getRunbook, updateRunbook, createVersion } from '@/app/actions/runbooks';
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

export default function EditRunbookPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activePhase, setActivePhase] = useState('detection');
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<RunbookStep | null>(null);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);

  // Runbook data
  const [originalRunbook, setOriginalRunbook] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState('');
  const [version, setVersion] = useState('1.0');
  const [newVersion, setNewVersion] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);
  const [steps, setSteps] = useState<RunbookStep[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

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

  useEffect(() => {
    loadRunbook();
  }, [params.id]);

  const loadRunbook = async () => {
    setIsLoading(true);
    try {
      const runbook = await getRunbook(params.id);
      if (!runbook) {
        toast.error('Runbook not found');
        router.push('/runbooks');
        return;
      }

      setOriginalRunbook(runbook);
      setTitle(runbook.title);
      setDescription(runbook.description || '');
      setClassification(runbook.classification || '');
      setVersion(runbook.version || '1.0');
      setIsTemplate(runbook.isTemplate);
      setSteps(runbook.steps || []);
    } catch (error) {
      toast.error('Failed to load runbook');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const sourcePhase = result.source.droppableId;
    const destPhase = result.destination.droppableId;

    // Filter steps for the source phase
    const sourceSteps = items.filter(s => s.phase === sourcePhase);
    const [movedStep] = sourceSteps.splice(result.source.index, 1);

    // Update the phase if dropped in a different phase
    if (sourcePhase !== destPhase) {
      movedStep.phase = destPhase;
    }

    // Filter steps for the destination phase (excluding the moved step)
    const destSteps = items.filter(s => s.phase === destPhase && s.id !== movedStep.id);
    destSteps.splice(result.destination.index, 0, movedStep);

    // Combine all steps and update step numbers
    const otherSteps = items.filter(s => s.phase !== sourcePhase && s.phase !== destPhase);
    const updatedSourceSteps = items.filter(s => s.phase === sourcePhase && s.id !== movedStep.id)
      .map((step, index) => ({ ...step, stepNumber: index + 1 }));
    const updatedDestSteps = destSteps.map((step, index) => ({ ...step, stepNumber: index + 1 }));

    setSteps([...otherSteps, ...updatedSourceSteps, ...updatedDestSteps]);
    setHasChanges(true);
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
    setHasChanges(true);
  };

  const editStep = (step: RunbookStep) => {
    setStepForm(step);
    setEditingStep(step);
    setShowStepDialog(true);
  };

  const confirmDeleteStep = (stepId: string) => {
    setStepToDelete(stepId);
    setShowDeleteDialog(true);
  };

  const deleteStep = () => {
    if (stepToDelete) {
      setSteps(steps.filter(s => s.id !== stepToDelete));
      setHasChanges(true);
      setStepToDelete(null);
    }
    setShowDeleteDialog(false);
  };

  const handleSave = async () => {
    if (!title || steps.length === 0) {
      toast.error('Please provide a title and at least one step');
      return;
    }

    setIsSaving(true);
    try {
      await updateRunbook(params.id, {
        title,
        description,
        classification: classification || undefined,
        version,
        isTemplate,
        steps: steps.map(({ id, ...step }) => step),
      });

      toast.success('Runbook updated successfully');
      setHasChanges(false);
      router.push(`/runbooks/${params.id}`);
    } catch (error) {
      toast.error('Failed to update runbook');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersion) {
      toast.error('Please provide a version number');
      return;
    }

    setIsSaving(true);
    try {
      const newRunbookId = await createVersion(params.id, newVersion);
      toast.success(`Version ${newVersion} created successfully`);
      router.push(`/runbooks/${newRunbookId}/edit`);
    } catch (error) {
      toast.error('Failed to create new version');
      console.error(error);
    } finally {
      setIsSaving(false);
      setShowVersionDialog(false);
    }
  };

  const phaseSteps = steps.filter(s => s.phase === activePhase);
  const totalDuration = steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
  const criticalSteps = steps.filter(s => s.isCritical).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading runbook...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/runbooks/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Runbook</h1>
            <p className="text-muted-foreground">
              Modify runbook procedures and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowVersionDialog(true)}
          >
            <History className="mr-2 h-4 w-4" />
            New Version
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm">You have unsaved changes</p>
          </CardContent>
        </Card>
      )}

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
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classification">Classification</Label>
              <Select
                value={classification}
                onValueChange={(value) => {
                  setClassification(value);
                  setHasChanges(true);
                }}
              >
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
              onChange={(e) => {
                setDescription(e.target.value);
                setHasChanges(true);
              }}
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
                  onChange={(e) => {
                    setVersion(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-24"
                  disabled
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="template"
                  checked={isTemplate}
                  onCheckedChange={(checked) => {
                    setIsTemplate(checked);
                    setHasChanges(true);
                  }}
                />
                <Label htmlFor="template">Template</Label>
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
                                    onDelete={confirmDeleteStep}
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

      {/* Version Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version of this runbook while preserving the current version
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-version">New Version Number</Label>
              <Input
                id="new-version"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="e.g., 2.0"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Current version: {version}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion} disabled={isSaving}>
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this step? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteStep}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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