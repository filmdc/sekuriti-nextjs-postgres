'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ArrowRight, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface RunbookExecution {
  id: number;
  runbookTitle: string;
  executorName: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  incidentId?: number;
  stepsCompleted: number;
  totalSteps: number;
}

interface RunbookActivityWidgetProps {
  executions: RunbookExecution[];
  totalRunbooks: number;
  activeExecutions: number;
}

const statusConfig = {
  running: {
    icon: Play,
    label: 'Running',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  failed: {
    icon: AlertCircle,
    label: 'Failed',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  paused: {
    icon: Clock,
    label: 'Paused',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  }
};

export function RunbookActivityWidget({
  executions,
  totalRunbooks,
  activeExecutions
}: RunbookActivityWidgetProps) {
  const utilizationPercentage = totalRunbooks > 0 ? Math.round(activeExecutions / totalRunbooks * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            Runbook Activity
          </CardTitle>
          <Badge variant="outline">
            {activeExecutions} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Utilization Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Runbook Utilization</span>
            <span className="text-sm font-bold text-green-600">{utilizationPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${utilizationPercentage}%` }}
            />
          </div>
        </div>

        {/* Execution Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Running</span>
              <span className="text-lg font-bold text-blue-600">
                {executions.filter(e => e.status === 'running').length}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-green-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Completed</span>
              <span className="text-lg font-bold text-green-600">
                {executions.filter(e => e.status === 'completed').length}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Executions</h4>
          {executions.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-2">
                <BookOpen className="h-8 w-8 mx-auto opacity-50" />
              </div>
              <p className="text-sm text-gray-500">No recent executions</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {executions.slice(0, 3).map((execution) => {
                const config = statusConfig[execution.status];
                const StatusIcon = config.icon;

                return (
                  <Link
                    key={execution.id}
                    href={execution.incidentId ? `/incidents/${execution.incidentId}` : `/runbooks/${execution.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`p-1 rounded-full ${config.bgColor} flex-shrink-0`}>
                          <StatusIcon className={`h-3 w-3 ${config.color}`} />
                        </div>
                        <span className="text-sm font-medium truncate">{execution.runbookTitle}</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Executor: {execution.executorName}</span>
                        <span>{execution.stepsCompleted}/{execution.totalSteps} steps</span>
                      </div>

                      {execution.status === 'running' && (
                        <div className="space-y-1">
                          <Progress value={execution.progress} className="h-1" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{execution.progress}% complete</span>
                            <span>
                              Started {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      )}

                      {execution.status === 'completed' && execution.completedAt && (
                        <div className="text-xs text-gray-500">
                          Completed {formatDistanceToNow(new Date(execution.completedAt), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button asChild size="sm" className="flex-1">
            <Link href="/runbooks/new">
              <BookOpen className="h-4 w-4 mr-1" />
              New Runbook
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/runbooks">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}