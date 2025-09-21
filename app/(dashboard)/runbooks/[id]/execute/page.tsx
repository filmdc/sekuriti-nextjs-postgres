'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  SkipForward,
  RefreshCw,
  BookOpen,
  Upload,
  Eye,
  Save,
  Flag,
  Timer,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  getRunbook,
  createExecution,
  updateExecutionStep,
  pauseExecution,
  resumeExecution,
  completeExecution,
  getExecutionReport,
  uploadExecutionEvidence,
  getStepEvidence,
} from '@/app/actions/runbooks';
import { EvidenceUpload } from '@/components/runbooks/evidence-upload';
import { StepTimer } from '@/components/runbooks/step-timer';
import { ExecutionReport } from '@/components/runbooks/execution-report';
import { MobileExecution } from '@/components/runbooks/mobile-execution';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/toast';

const PHASES = [
  { id: 'detection', label: 'Detection', color: 'bg-blue-500', icon: '🔍' },
  { id: 'containment', label: 'Containment', color: 'bg-yellow-500', icon: '🛡️' },
  { id: 'eradication', label: 'Eradication', color: 'bg-orange-500', icon: '🗑️' },
  { id: 'recovery', label: 'Recovery', color: 'bg-green-500', icon: '♻️' },
  { id: 'post_incident', label: 'Post-Incident', color: 'bg-purple-500', icon: '📝' },
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

interface StepExecution {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  executedBy?: string;
  notes?: string;
  actualDuration?: number;
}

export default function ExecuteRunbookPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { incident?: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [runbook, setRunbook] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executionStartTime, setExecutionStartTime] = useState<Date | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [stepExecutions, setStepExecutions] = useState<Map<string, StepExecution>>(new Map());
  const [isPaused, setIsPaused] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentStepNotes, setCurrentStepNotes] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [executionReport, setExecutionReport] = useState<any>(null);
  const [stepEvidence, setStepEvidence] = useState<any[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (executionStartTime && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - executionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [executionStartTime, isPaused]);

  useEffect(() => {
    loadRunbook();
  }, [params.id]);

  useEffect(() => {
    if (currentStep && executionId) {
      loadStepEvidence(currentStep.id.toString());
    }
  }, [currentStepIndex, executionId]);

  const loadRunbook = async () => {
    setIsLoading(true);
    try {
      const data = await getRunbook(params.id);
      if (!data) {
        toast.error('Runbook not found');
        router.push('/runbooks');
        return;
      }
      setRunbook(data);

      // Initialize step executions
      const executions = new Map<string, StepExecution>();
      data.steps?.forEach((step: RunbookStep) => {
        executions.set(step.id, {
          stepId: step.id,
          status: 'pending',
        });
      });
      setStepExecutions(executions);
    } catch (error) {
      toast.error('Failed to load runbook');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startExecution = async () => {
    try {
      const execId = await createExecution({
        runbookId: params.id,
        incidentId: searchParams.incident,
      });
      setExecutionId(execId);
      setExecutionStartTime(new Date());

      // Mark first step as in progress
      const firstStep = runbook.steps?.[0];
      if (firstStep) {
        updateStepStatus(firstStep.id, 'in_progress');
      }

      toast.success('Runbook execution started');
    } catch (error) {
      toast.error('Failed to start execution');
      console.error(error);
    }
  };

  const handlePauseResume = async () => {
    if (!executionId) return;

    try {
      if (isPaused) {
        await resumeExecution(executionId);
        setIsPaused(false);
        toast.success('Execution resumed');
      } else {
        await pauseExecution(executionId);
        setIsPaused(true);
        toast.success('Execution paused');
      }
    } catch (error) {
      toast.error('Failed to update execution status');
      console.error(error);
    }
  };

  const handleCompleteExecution = async () => {
    if (!executionId) return;

    try {
      await completeExecution(executionId, currentStepNotes);
      await loadExecutionReport();
      setShowReportDialog(true);
      toast.success('Runbook execution completed!');
    } catch (error) {
      toast.error('Failed to complete execution');
      console.error(error);
    }
  };

  const loadExecutionReport = async () => {
    if (!executionId) return;

    setIsLoadingReport(true);
    try {
      const report = await getExecutionReport(executionId);
      setExecutionReport(report);
    } catch (error) {
      toast.error('Failed to load execution report');
      console.error(error);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const loadStepEvidence = async (stepId: string) => {
    if (!executionId) return;

    try {
      const evidence = await getStepEvidence(executionId, stepId);
      setStepEvidence(evidence || []);
    } catch (error) {
      console.error('Failed to load step evidence:', error);
      setStepEvidence([]);
    }
  };

  const handleEvidenceUpload = async (evidence: any[]) => {
    if (!executionId || !currentStep) return;

    try {
      await updateExecutionStep(executionId, currentStep.id.toString(), {
        status: stepExecutions.get(currentStep.id)?.status || 'in_progress',
        evidence,
      });
      await loadStepEvidence(currentStep.id.toString());
      toast.success('Evidence uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload evidence');
      console.error(error);
    }
  };

  const updateStepStatus = async (stepId: string, status: StepExecution['status'], notes?: string) => {
    setStepExecutions(prev => {
      const updated = new Map(prev);
      const execution = updated.get(stepId);
      if (execution) {
        execution.status = status;
        if (status === 'in_progress') {
          execution.startedAt = new Date();
        } else if (status === 'completed' || status === 'skipped') {
          execution.completedAt = new Date();
          if (execution.startedAt) {
            execution.actualDuration = Math.floor(
              (execution.completedAt.getTime() - execution.startedAt.getTime()) / 60000
            );
          }
        }
        if (notes) {
          execution.notes = notes;
        }
      }
      return updated;
    });

    // Save to backend
    if (executionId) {
      try {
        await updateExecutionStep(executionId, stepId, { status, notes });
      } catch (error) {
        toast.error('Failed to update step status');
        console.error(error);
      }
    }
  };

  const completeCurrentStep = () => {
    const currentStep = runbook.steps?.[currentStepIndex];
    if (currentStep) {
      updateStepStatus(currentStep.id, 'completed', currentStepNotes);
      setCurrentStepNotes('');

      // Move to next step
      if (currentStepIndex < (runbook.steps?.length || 1) - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        const nextStep = runbook.steps?.[nextIndex];
        if (nextStep) {
          updateStepStatus(nextStep.id, 'in_progress');
        }
      } else {
        // All steps completed
        handleCompleteExecution();
      }
    }
  };

  const skipCurrentStep = () => {
    const currentStep = runbook.steps?.[currentStepIndex];
    if (currentStep) {
      updateStepStatus(currentStep.id, 'skipped', currentStepNotes);
      setCurrentStepNotes('');

      // Move to next step
      if (currentStepIndex < (runbook.steps?.length || 1) - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        const nextStep = runbook.steps?.[nextIndex];
        if (nextStep) {
          updateStepStatus(nextStep.id, 'in_progress');
        }
      }
    }
  };

  const goToStep = (index: number) => {
    const prevStep = runbook.steps[currentStepIndex];
    const newStep = runbook.steps[index];

    if (prevStep && stepExecutions.get(prevStep.id)?.status === 'in_progress') {
      updateStepStatus(prevStep.id, 'pending');
    }

    setCurrentStepIndex(index);
    if (newStep) {
      updateStepStatus(newStep.id, 'in_progress');
    }
  };

  if (isLoading || !runbook) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading runbook...</div>
      </div>
    );
  }

  const currentStep = runbook.steps?.[currentStepIndex];
  const completedSteps = Array.from(stepExecutions.values()).filter(
    e => e.status === 'completed'
  ).length;
  const progressPercentage = runbook.steps?.length ? (completedSteps / runbook.steps.length) * 100 : 0;

  // Group steps by phase for sidebar
  const stepsByPhase = runbook.steps?.reduce((acc: any, step: RunbookStep, index: number) => {
    if (!acc[step.phase]) {
      acc[step.phase] = [];
    }
    acc[step.phase].push({ ...step, index });
    return acc;
  }, {}) || {};

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const breadcrumbItems = [
    { label: 'Runbooks', href: '/runbooks', icon: BookOpen },
    { label: runbook.title, href: `/runbooks/${params.id}` },
    { label: 'Execute' }
  ];

  // Mobile responsive check
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileExecution
        runbook={runbook}
        currentStepIndex={currentStepIndex}
        stepExecutions={stepExecutions}
        executionStartTime={executionStartTime}
        isPaused={isPaused}
        elapsedTime={elapsedTime}
        onStepComplete={completeCurrentStep}
        onStepSkip={skipCurrentStep}
        onPauseResume={handlePauseResume}
        onGoToStep={goToStep}
        onNotesChange={setCurrentStepNotes}
        onEvidenceUpload={() => setShowEvidenceDialog(true)}
        notes={currentStepNotes}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Breadcrumb */}
      <div className="p-4 border-b">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with step list */}
        <div className="w-80 border-r bg-muted/10">
          <div className="p-4 border-b">
            <Link href={`/runbooks/${params.id}`}>
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Runbook
              </Button>
            </Link>
            <h2 className="font-semibold">{runbook.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {runbook.description}
            </p>
          </div>

        <ScrollArea className="h-[calc(100%-8rem)]">
          <div className="p-4 space-y-4">
            {PHASES.map((phase) => {
              const phaseSteps = stepsByPhase[phase.id] || [];
              if (phaseSteps.length === 0) return null;

              return (
                <div key={phase.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{phase.icon}</span>
                    <span className="text-sm font-medium">{phase.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {phaseSteps.filter((s: any) =>
                        stepExecutions.get(s.id)?.status === 'completed'
                      ).length}/{phaseSteps.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {phaseSteps.map((step: any) => {
                      const execution = stepExecutions.get(step.id);
                      const isActive = step.index === currentStepIndex;

                      return (
                        <button
                          key={step.id}
                          onClick={() => goToStep(step.index)}
                          className={`w-full text-left p-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {execution?.status === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : execution?.status === 'in_progress' ? (
                                <Circle className="h-4 w-4 text-yellow-500 animate-pulse" />
                              ) : execution?.status === 'skipped' ? (
                                <SkipForward className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${isActive ? '' : 'text-muted-foreground'}`}>
                                {step.title}
                              </p>
                              {step.isCritical && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs mt-1"
                                >
                                  Critical
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        </div>
      </div>

      {/* Main execution area */}
      <div className="flex-1 flex flex-col">
        {/* Execution header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!executionStartTime ? (
                <Button onClick={startExecution}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Execution
                </Button>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <StepTimer
                      estimatedDuration={currentStep?.estimatedDuration || 30}
                      startedAt={stepExecutions.get(currentStep?.id)?.startedAt}
                      isActive={stepExecutions.get(currentStep?.id)?.status === 'in_progress'}
                      isPaused={isPaused}
                      variant="compact"
                    />
                  </div>
                  <Button
                    variant={isPaused ? 'default' : 'outline'}
                    onClick={handlePauseResume}
                  >
                    {isPaused ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{formatTime(elapsedTime)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {runbook.steps?.length || 0}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToStep(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => goToStep(Math.min((runbook.steps?.length || 1) - 1, currentStepIndex + 1))}
                disabled={currentStepIndex === (runbook.steps?.length || 1) - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {completedSteps === (runbook.steps?.length || 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (executionReport) {
                      setShowReportDialog(true);
                    } else {
                      loadExecutionReport();
                    }
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Report
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Current step details */}
        <ScrollArea className="flex-1 p-6">
          {currentStep && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Step header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {currentStep.title}
                        {currentStep.isCritical && (
                          <Badge variant="destructive">Critical</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Phase: {PHASES.find(p => p.id === currentStep.phase)?.label}
                      </CardDescription>
                    </div>
                    <div className="text-right space-y-1">
                      {currentStep.responsibleRole && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{currentStep.responsibleRole}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Est: {currentStep.estimatedDuration} min</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="instructions" className="w-full">
                    <TabsList>
                      <TabsTrigger value="instructions">Instructions</TabsTrigger>
                      {currentStep.tools && <TabsTrigger value="tools">Tools</TabsTrigger>}
                      {currentStep.notes && <TabsTrigger value="notes">Notes</TabsTrigger>}
                      <TabsTrigger value="timer">Timer</TabsTrigger>
                      <TabsTrigger value="evidence">
                        Evidence ({stepEvidence.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="instructions" className="mt-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{currentStep.description}</p>
                      </div>

                      {currentStep.isCritical && (
                        <Alert className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Critical Step</AlertTitle>
                          <AlertDescription>
                            This is a critical step. Please ensure all instructions are followed carefully.
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>

                    {currentStep.tools && (
                      <TabsContent value="tools" className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                              <code>{currentStep.tools}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}

                    {currentStep.notes && (
                      <TabsContent value="notes" className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm whitespace-pre-wrap">{currentStep.notes}</p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}

                    <TabsContent value="timer" className="mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <StepTimer
                            estimatedDuration={currentStep.estimatedDuration}
                            startedAt={stepExecutions.get(currentStep.id)?.startedAt}
                            isActive={stepExecutions.get(currentStep.id)?.status === 'in_progress'}
                            isPaused={isPaused}
                            onTogglePause={handlePauseResume}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="evidence" className="mt-4">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Step Evidence</CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowEvidenceDialog(true)}
                              disabled={!executionStartTime}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload
                            </Button>
                          </div>
                          <CardDescription>
                            Files and documentation collected for this step
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {stepEvidence.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              No evidence uploaded for this step
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {stepEvidence.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <div>
                                      <p className="text-sm font-medium">{item.evidence.fileName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Uploaded by {item.uploader.name}
                                      </p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Step actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Step Completion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="step-notes">Execution Notes (Optional)</Label>
                    <Textarea
                      id="step-notes"
                      placeholder="Add any notes about the execution of this step..."
                      value={currentStepNotes}
                      onChange={(e) => setCurrentStepNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="confirm" />
                      <Label htmlFor="confirm">
                        I confirm this step has been completed
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={completeCurrentStep}
                      disabled={!executionStartTime}
                      className="flex-1"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete Step
                    </Button>
                    <Button
                      variant="outline"
                      onClick={skipCurrentStep}
                      disabled={!executionStartTime}
                    >
                      <SkipForward className="mr-2 h-4 w-4" />
                      Skip
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEvidenceDialog(true)}
                      disabled={!executionStartTime}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Evidence
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNotesDialog(true)}
                      disabled={!executionStartTime}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step history */}
              {stepExecutions.get(currentStep.id)?.status === 'completed' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step Execution History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="success">Completed</Badge>
                      </div>
                      {stepExecutions.get(currentStep.id)?.actualDuration && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Actual Duration:</span>
                          <span>{stepExecutions.get(currentStep.id)?.actualDuration} min</span>
                        </div>
                      )}
                      {stepExecutions.get(currentStep.id)?.notes && (
                        <div>
                          <span className="text-muted-foreground">Notes:</span>
                          <p className="mt-1 p-2 bg-muted rounded">
                            {stepExecutions.get(currentStep.id)?.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
        </div>
      </div>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Execution Note</DialogTitle>
            <DialogDescription>
              Add a note about the current step execution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your note..."
              value={currentStepNotes}
              onChange={(e) => setCurrentStepNotes(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const currentStep = runbook.steps?.[currentStepIndex];
              if (currentStep) {
                const execution = stepExecutions.get(currentStep.id);
                if (execution) {
                  execution.notes = currentStepNotes;
                }
              }
              setShowNotesDialog(false);
              toast.success('Note added');
            }}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence Upload Dialog */}
      <EvidenceUpload
        open={showEvidenceDialog}
        onOpenChange={setShowEvidenceDialog}
        onUpload={handleEvidenceUpload}
      />

      {/* Execution Report Dialog */}
      {executionReport && (
        <ExecutionReport
          data={executionReport}
          trigger={
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogContent className="hidden" />
            </Dialog>
          }
        />
      )}
    </div>
  );
}