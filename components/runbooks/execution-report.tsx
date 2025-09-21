'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  User,
  FileText,
  SkipForward,
  AlertTriangle,
  Download,
  Printer,
  Calendar,
  Timer,
  TrendingUp,
  Users,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ExecutionReportData {
  execution: {
    id: number;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    totalDuration?: number;
    executionNotes?: string;
    runbook: {
      title: string;
      description?: string;
      classification?: string;
    };
    executor: {
      name: string;
      email: string;
    };
  };
  steps: Array<{
    stepExecution: {
      status: string;
      startedAt?: Date;
      completedAt?: Date;
      duration?: number;
      notes?: string;
    };
    step: {
      title: string;
      description: string;
      phase: string;
      estimatedDuration: number;
      isCritical: boolean;
    };
    executedBy?: {
      name: string;
      email: string;
    };
  }>;
  evidence: Array<{
    evidence: {
      fileName: string;
      fileUrl: string;
      description?: string;
      uploadedAt: Date;
    };
    uploader: {
      name: string;
    };
  }>;
  summary: {
    totalSteps: number;
    completedSteps: number;
    skippedSteps: number;
    totalDuration?: number;
    evidenceCount: number;
  };
}

interface ExecutionReportProps {
  data: ExecutionReportData;
  trigger?: React.ReactNode;
}

const PHASES = [
  { id: 'detection', label: 'Detection', color: 'bg-blue-500', icon: '🔍' },
  { id: 'containment', label: 'Containment', color: 'bg-yellow-500', icon: '🛡️' },
  { id: 'eradication', label: 'Eradication', color: 'bg-orange-500', icon: '🗑️' },
  { id: 'recovery', label: 'Recovery', color: 'bg-green-500', icon: '♻️' },
  { id: 'post_incident', label: 'Post-Incident', color: 'bg-purple-500', icon: '📝' },
];

export function ExecutionReport({ data, trigger }: ExecutionReportProps) {
  const [open, setOpen] = useState(false);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Skipped</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getPhaseSteps = (phase: string) => {
    return data.steps.filter(step => step.step.phase === phase);
  };

  const exportReport = () => {
    // In a real implementation, this would generate a PDF or formatted document
    const reportContent = `
RUNBOOK EXECUTION REPORT
========================

Runbook: ${data.execution.runbook.title}
Executor: ${data.execution.executor.name}
Started: ${formatDate(data.execution.startedAt)}
Completed: ${data.execution.completedAt ? formatDate(data.execution.completedAt) : 'In Progress'}
Duration: ${formatDuration(data.execution.totalDuration)}

SUMMARY
=======
Total Steps: ${data.summary.totalSteps}
Completed: ${data.summary.completedSteps}
Skipped: ${data.summary.skippedSteps}
Evidence Collected: ${data.summary.evidenceCount}

STEP DETAILS
============
${data.steps.map((step, index) => `
${index + 1}. ${step.step.title} (${step.step.phase})
   Status: ${step.stepExecution.status}
   Duration: ${formatDuration(step.stepExecution.duration)}
   ${step.stepExecution.notes ? `Notes: ${step.stepExecution.notes}` : ''}
`).join('\n')}

${data.execution.executionNotes ? `
EXECUTION NOTES
===============
${data.execution.executionNotes}
` : ''}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-report-${data.execution.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Execution Report</DialogTitle>
          <DialogDescription>
            Detailed report for runbook execution #{data.execution.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Executive Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {data.summary.completedSteps}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {data.summary.skippedSteps}
                        </div>
                        <div className="text-sm text-muted-foreground">Skipped</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatDuration(data.execution.totalDuration)}
                        </div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {data.summary.evidenceCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Evidence</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Execution Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Runbook:</span>
                          <span>{data.execution.runbook.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Executor:</span>
                          <span>{data.execution.executor.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Started:</span>
                          <span>{formatDate(data.execution.startedAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {data.execution.completedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Completed:</span>
                            <span>{formatDate(data.execution.completedAt)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Total Duration:</span>
                          <span>{formatDuration(data.execution.totalDuration)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Status:</span>
                          {getStatusBadge(data.execution.status)}
                        </div>
                      </div>
                    </div>

                    {data.execution.executionNotes && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Execution Notes</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {data.execution.executionNotes}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Phase Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Phase Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {PHASES.map((phase) => {
                        const phaseSteps = getPhaseSteps(phase.id);
                        if (phaseSteps.length === 0) return null;

                        const completed = phaseSteps.filter(s => s.stepExecution.status === 'completed').length;
                        const skipped = phaseSteps.filter(s => s.stepExecution.status === 'skipped').length;

                        return (
                          <div key={phase.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{phase.icon}</span>
                              <div>
                                <div className="font-medium">{phase.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {phaseSteps.length} {phaseSteps.length === 1 ? 'step' : 'steps'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {completed} completed
                              </Badge>
                              {skipped > 0 && (
                                <Badge variant="outline">
                                  {skipped} skipped
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Timeline</CardTitle>
                    <CardDescription>
                      Chronological view of step execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.steps.map((step, index) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{step.step.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {PHASES.find(p => p.id === step.step.phase)?.label}
                                  {step.step.isCritical && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                      Critical
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                {getStatusBadge(step.stepExecution.status)}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDuration(step.stepExecution.duration)}
                                </p>
                              </div>
                            </div>
                            {step.stepExecution.notes && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                {step.stepExecution.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evidence" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Evidence Collection
                    </CardTitle>
                    <CardDescription>
                      Files and documentation collected during execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {data.evidence.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No evidence was collected during this execution.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.evidence.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                <Paperclip className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{item.evidence.fileName}</div>
                                <div className="text-sm text-muted-foreground">
                                  Uploaded by {item.uploader.name} on{' '}
                                  {formatDate(item.evidence.uploadedAt)}
                                </div>
                                {item.evidence.description && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {item.evidence.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Report</CardTitle>
                    <CardDescription>
                      Download or print the execution report
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button onClick={exportReport} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download as Text
                      </Button>
                      <Button variant="outline" onClick={() => window.print()} className="w-full">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Report
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>The report includes:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Complete execution timeline</li>
                        <li>Step-by-step details and notes</li>
                        <li>Evidence collection summary</li>
                        <li>Performance metrics</li>
                        <li>Executor information</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}