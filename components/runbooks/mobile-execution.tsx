'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Upload,
  MessageSquare,
  SkipForward,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepTimer } from './step-timer';

interface MobileExecutionProps {
  runbook: any;
  currentStepIndex: number;
  stepExecutions: Map<string, any>;
  executionStartTime: Date | null;
  isPaused: boolean;
  elapsedTime: number;
  onStepComplete: () => void;
  onStepSkip: () => void;
  onPauseResume: () => void;
  onGoToStep: (index: number) => void;
  onNotesChange: (notes: string) => void;
  onEvidenceUpload: () => void;
  notes: string;
}

const PHASES = [
  { id: 'detection', label: 'Detection', color: 'bg-blue-500', icon: '🔍' },
  { id: 'containment', label: 'Containment', color: 'bg-yellow-500', icon: '🛡️' },
  { id: 'eradication', label: 'Eradication', color: 'bg-orange-500', icon: '🗑️' },
  { id: 'recovery', label: 'Recovery', color: 'bg-green-500', icon: '♻️' },
  { id: 'post_incident', label: 'Post-Incident', color: 'bg-purple-500', icon: '📝' },
];

export function MobileExecution({
  runbook,
  currentStepIndex,
  stepExecutions,
  executionStartTime,
  isPaused,
  elapsedTime,
  onStepComplete,
  onStepSkip,
  onPauseResume,
  onGoToStep,
  onNotesChange,
  onEvidenceUpload,
  notes,
}: MobileExecutionProps) {
  const [showStepsList, setShowStepsList] = useState(false);

  const currentStep = runbook.steps?.[currentStepIndex];
  const completedSteps = Array.from(stepExecutions.values()).filter(
    e => e.status === 'completed'
  ).length;
  const progressPercentage = runbook.steps?.length ? (completedSteps / runbook.steps.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Circle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-gray-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const groupStepsByPhase = () => {
    return runbook.steps?.reduce((acc: any, step: any, index: number) => {
      if (!acc[step.phase]) {
        acc[step.phase] = [];
      }
      acc[step.phase].push({ ...step, index });
      return acc;
    }, {}) || {};
  };

  const stepsByPhase = groupStepsByPhase();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={showStepsList} onOpenChange={setShowStepsList}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>{runbook.title}</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                  <div className="space-y-4">
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
                                  onClick={() => {
                                    onGoToStep(step.index);
                                    setShowStepsList(false);
                                  }}
                                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                                    isActive
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="mt-0.5">
                                      {getStatusIcon(execution?.status || 'pending')}
                                    </div>
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${
                                        isActive ? '' : 'text-muted-foreground'
                                      }`}>
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
              </SheetContent>
            </Sheet>
            <div>
              <h2 className="font-semibold text-lg">{runbook.title}</h2>
              <p className="text-xs text-muted-foreground">
                Step {currentStepIndex + 1} of {runbook.steps?.length || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {executionStartTime && (
              <>
                <div className="text-xs text-muted-foreground font-mono">
                  {formatTime(elapsedTime)}
                </div>
                <Button
                  variant={isPaused ? 'default' : 'outline'}
                  size="sm"
                  onClick={onPauseResume}
                >
                  {isPaused ? (
                    <Play className="h-3 w-3" />
                  ) : (
                    <Pause className="h-3 w-3" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{completedSteps} completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 px-4 py-4">
        {currentStep && (
          <div className="space-y-4">
            {/* Step Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {currentStep.title}
                      {currentStep.isCritical && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {PHASES.find(p => p.id === currentStep.phase)?.label}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Est: {currentStep.estimatedDuration}m
                    </div>
                    {currentStep.responsibleRole && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {currentStep.responsibleRole}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Step Timer */}
            <Card>
              <CardContent className="pt-4">
                <StepTimer
                  estimatedDuration={currentStep.estimatedDuration}
                  startedAt={stepExecutions.get(currentStep.id)?.startedAt}
                  isActive={stepExecutions.get(currentStep.id)?.status === 'in_progress'}
                  isPaused={isPaused}
                />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm">{currentStep.description}</p>
                </div>

                {currentStep.isCritical && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium text-sm">Critical Step</span>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      This is a critical step. Please ensure all instructions are followed carefully.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tools */}
            {currentStep.tools && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tools & Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                    <code>{currentStep.tools}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Execution Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about this step execution..."
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-background border-t px-4 py-3">
        <div className="space-y-3">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGoToStep(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGoToStep(Math.min((runbook.steps?.length || 1) - 1, currentStepIndex + 1))}
              disabled={currentStepIndex === (runbook.steps?.length || 1) - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onStepComplete}
              disabled={!executionStartTime}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete
            </Button>
            <Button
              variant="outline"
              onClick={onStepSkip}
              disabled={!executionStartTime}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Skip
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onEvidenceUpload}
              disabled={!executionStartTime}
              size="sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              Evidence
            </Button>
            <Button
              variant="outline"
              onClick={() => {/* Handle notes */}}
              disabled={!executionStartTime}
              size="sm"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}