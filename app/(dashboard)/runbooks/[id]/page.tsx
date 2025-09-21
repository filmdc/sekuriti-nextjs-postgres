import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Play,
  Clock,
  Users,
  AlertTriangle,
  Copy,
  Printer,
  Share2,
  ChevronRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { getRunbook } from '@/app/actions/runbooks';

const PHASES = [
  { id: 'detection', label: 'Detection', color: 'bg-blue-500', icon: '🔍' },
  { id: 'containment', label: 'Containment', color: 'bg-yellow-500', icon: '🛡️' },
  { id: 'eradication', label: 'Eradication', color: 'bg-orange-500', icon: '🗑️' },
  { id: 'recovery', label: 'Recovery', color: 'bg-green-500', icon: '♻️' },
  { id: 'post_incident', label: 'Post-Incident', color: 'bg-purple-500', icon: '📝' },
];

export default async function RunbookPage({
  params,
}: {
  params: { id: string };
}) {
  const runbook = await getRunbook(params.id);

  if (!runbook) {
    notFound();
  }

  // Group steps by phase
  const stepsByPhase = runbook.steps?.reduce((acc: any, step: any) => {
    if (!acc[step.phase]) {
      acc[step.phase] = [];
    }
    acc[step.phase].push(step);
    return acc;
  }, {}) || {};

  // Calculate statistics
  const totalDuration = runbook.steps?.reduce((sum: number, step: any) =>
    sum + (step.estimatedDuration || 0), 0) || 0;
  const criticalSteps = runbook.steps?.filter((s: any) => s.isCritical).length || 0;
  const uniqueRoles = [...new Set(runbook.steps?.map((s: any) => s.responsibleRole).filter(Boolean))] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/runbooks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{runbook.title}</h1>
              {runbook.isTemplate && (
                <Badge variant="secondary">Template</Badge>
              )}
              <Badge variant="outline">v{runbook.version}</Badge>
            </div>
            <p className="text-muted-foreground">
              {runbook.description || 'No description provided'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
          <Link href={`/runbooks/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/runbooks/${params.id}/execute`}>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Execute
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runbook.steps?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Estimated Duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {totalDuration < 60
                  ? `${totalDuration} min`
                  : `${Math.round(totalDuration / 60)}h ${totalDuration % 60}m`}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Critical Steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold">{criticalSteps}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Roles Involved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{uniqueRoles.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classification and Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Classification & Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {runbook.classification && (
              <Badge variant="outline" className="capitalize">
                {runbook.classification.replace('_', ' ')}
              </Badge>
            )}
            {runbook.tags?.map((tag: any) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Response Phases</CardTitle>
          <CardDescription>
            Overview of all phases and their completion status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PHASES.map((phase) => {
              const phaseSteps = stepsByPhase[phase.id] || [];
              const phaseDuration = phaseSteps.reduce(
                (sum: number, step: any) => sum + (step.estimatedDuration || 0),
                0
              );
              const hasCritical = phaseSteps.some((s: any) => s.isCritical);

              return (
                <div key={phase.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                    {phase.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{phase.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {phaseSteps.length} steps
                        </Badge>
                        {hasCritical && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {phaseDuration} min
                      </span>
                    </div>
                    <Progress
                      value={phaseSteps.length > 0 ? 100 : 0}
                      className={`h-2 mt-2 ${phase.color.replace('bg-', '[&>div]:bg-')}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Steps</CardTitle>
          <CardDescription>
            Complete runbook procedures organized by phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="detection" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              {PHASES.map((phase) => (
                <TabsTrigger key={phase.id} value={phase.id}>
                  {phase.label}
                  {stepsByPhase[phase.id]?.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {stepsByPhase[phase.id].length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {PHASES.map((phase) => {
              const phaseSteps = stepsByPhase[phase.id] || [];

              return (
                <TabsContent key={phase.id} value={phase.id}>
                  {phaseSteps.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Circle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No steps defined for this phase
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {phaseSteps.map((step: any, index: number) => (
                        <AccordionItem key={step.id} value={step.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{step.title}</span>
                                    {step.isCritical && (
                                      <Badge variant="destructive" className="text-xs">
                                        Critical
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {step.responsibleRole && (
                                      <span>{step.responsibleRole}</span>
                                    )}
                                    <span>{step.estimatedDuration} min</span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="space-y-4 pl-12">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {step.description}
                                </p>
                              </div>
                              {step.tools && (
                                <div>
                                  <h4 className="font-medium mb-2">Tools & Scripts</h4>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                                    {step.tools}
                                  </p>
                                </div>
                              )}
                              {step.notes && (
                                <div>
                                  <h4 className="font-medium mb-2">Additional Notes</h4>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {step.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Roles Summary */}
      {uniqueRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Role Assignments</CardTitle>
            <CardDescription>
              Team members responsible for executing this runbook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uniqueRoles.map((role: any) => {
                const roleSteps = runbook.steps?.filter((s: any) => s.responsibleRole === role) || [];
                return (
                  <div key={role} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{role}</p>
                      <p className="text-sm text-muted-foreground">
                        {roleSteps.length} step{roleSteps.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}