'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  SkipForward,
  Target,
  Timer,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface ExecutionSummaryProps {
  execution: {
    id: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    totalDuration?: number;
    completedSteps: number;
    totalSteps: number;
    runbook: {
      title: string;
      classification?: string;
    };
    executor: {
      name: string;
    };
  };
  steps: Array<{
    stepExecution: {
      status: string;
      duration?: number;
      notes?: string;
    };
    step: {
      title: string;
      phase: string;
      estimatedDuration: number;
      isCritical: boolean;
    };
  }>;
  onViewReport?: () => void;
}

const PHASES = [
  { id: 'detection', label: 'Detection', color: 'bg-blue-500', icon: '🔍' },
  { id: 'containment', label: 'Containment', color: 'bg-yellow-500', icon: '🛡️' },
  { id: 'eradication', label: 'Eradication', color: 'bg-orange-500', icon: '🗑️' },
  { id: 'recovery', label: 'Recovery', color: 'bg-green-500', icon: '♻️' },
  { id: 'post_incident', label: 'Post-Incident', color: 'bg-purple-500', icon: '📝' },
];

export function ExecutionSummary({ execution, steps, onViewReport }: ExecutionSummaryProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const completionPercentage = (execution.completedSteps / execution.totalSteps) * 100;
  const skippedSteps = steps.filter(s => s.stepExecution.status === 'skipped').length;
  const criticalSteps = steps.filter(s => s.step.isCritical);
  const completedCriticalSteps = criticalSteps.filter(s => s.stepExecution.status === 'completed').length;

  // Calculate phase completion
  const phaseStats = PHASES.map(phase => {
    const phaseSteps = steps.filter(s => s.step.phase === phase.id);
    const completed = phaseSteps.filter(s => s.stepExecution.status === 'completed').length;
    return {
      ...phase,
      total: phaseSteps.length,
      completed,
      percentage: phaseSteps.length > 0 ? (completed / phaseSteps.length) * 100 : 0,
    };
  }).filter(phase => phase.total > 0);

  // Performance metrics
  const totalEstimatedTime = steps.reduce((acc, step) => acc + step.step.estimatedDuration, 0);
  const actualTime = execution.totalDuration ? Math.floor(execution.totalDuration / 60) : 0;
  const timeDifference = actualTime - totalEstimatedTime;
  const isOnTime = timeDifference <= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Execution Complete
              </CardTitle>
              <CardDescription className="mt-1">
                {execution.runbook.title} • Executed by {execution.executor.name}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge
                variant={execution.status === 'completed' ? 'default' : 'secondary'}
                className="mb-2"
              >
                {execution.status}
              </Badge>
              {execution.runbook.classification && (
                <div className="text-sm text-muted-foreground">
                  {execution.runbook.classification}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Math.round(completionPercentage)}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatDuration(execution.totalDuration)}</p>
                <p className="text-xs text-muted-foreground">Total Duration</p>
              </div>
              <Timer className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 text-xs">
              <span className={isOnTime ? 'text-green-600' : 'text-red-600'}>
                {isOnTime ? 'On Time' : `Over by ${Math.abs(timeDifference)}m`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{execution.completedSteps}</p>
                <p className="text-xs text-muted-foreground">Steps Completed</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              of {execution.totalSteps} total steps
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{completedCriticalSteps}</p>
                <p className="text-xs text-muted-foreground">Critical Steps</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              of {criticalSteps.length} critical
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Phase Completion</CardTitle>
          <CardDescription>
            Progress breakdown by incident response phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phaseStats.map((phase) => (
              <div key={phase.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{phase.icon}</span>
                    <span className="font-medium">{phase.label}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {phase.completed}/{phase.total} steps
                  </div>
                </div>
                <Progress value={phase.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Started</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(execution.startedAt)}
              </span>
            </div>

            {execution.completedAt && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Completed</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(execution.completedAt)}
                </span>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600">{execution.completedSteps} Completed</p>
                <p className="text-muted-foreground">Successfully finished</p>
              </div>
              {skippedSteps > 0 && (
                <div>
                  <p className="font-medium text-yellow-600">{skippedSteps} Skipped</p>
                  <p className="text-muted-foreground">Bypassed steps</p>
                </div>
              )}
              <div>
                <p className="font-medium text-blue-600">{formatDuration(execution.totalDuration)}</p>
                <p className="text-muted-foreground">Total execution time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {onViewReport && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Detailed Report</h3>
                <p className="text-sm text-muted-foreground">
                  View comprehensive execution report with evidence and notes
                </p>
              </div>
              <Button onClick={onViewReport}>
                <FileText className="mr-2 h-4 w-4" />
                View Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}