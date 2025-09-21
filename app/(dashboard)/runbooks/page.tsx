import { Suspense } from 'react';
import { Plus, Search, Filter, BookOpen, Clock, Tag, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRunbooks } from '@/lib/db/queries-ir';
import { getTeamForUser } from '@/lib/db/queries';

const INCIDENT_CLASSIFICATIONS = [
  'malware',
  'phishing',
  'data_breach',
  'ddos',
  'insider_threat',
  'ransomware',
  'social_engineering',
  'supply_chain',
  'other'
];

const PHASES = [
  { id: 'detection', label: 'Detection', color: 'bg-blue-500' },
  { id: 'containment', label: 'Containment', color: 'bg-yellow-500' },
  { id: 'eradication', label: 'Eradication', color: 'bg-orange-500' },
  { id: 'recovery', label: 'Recovery', color: 'bg-green-500' },
  { id: 'post_incident', label: 'Post-Incident', color: 'bg-purple-500' },
];

export default async function RunbooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classification?: string; template?: string }>;
}) {
  const params = await searchParams;
  const team = await getTeamForUser();
  if (!team) {
    throw new Error('No team found');
  }

  const runbooks = await getRunbooks(team.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Runbooks</h1>
          <p className="text-muted-foreground">
            Standardized response procedures for incident handling
          </p>
        </div>
        <Link href="/runbooks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Runbook
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search runbooks..."
            className="pl-10"
            defaultValue={params.q}
          />
        </div>
        <Select defaultValue={params.classification || 'all'}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classifications</SelectItem>
            {INCIDENT_CLASSIFICATIONS.map((classification) => (
              <SelectItem key={classification} value={classification}>
                {classification.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs for Templates vs Custom */}
      <Tabs defaultValue={params.template === 'true' ? 'templates' : 'custom'}>
        <TabsList>
          <TabsTrigger value="custom">Custom Runbooks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          <RunbookGrid runbooks={runbooks.filter(r => !r.isTemplate)} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <RunbookGrid runbooks={runbooks.filter(r => r.isTemplate)} isTemplate />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RunbookGrid({ runbooks, isTemplate = false }: { runbooks: any[]; isTemplate?: boolean }) {
  if (runbooks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No runbooks found</p>
          <p className="text-sm text-muted-foreground">
            {isTemplate ? 'No templates available' : 'Create your first runbook to get started'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {runbooks.map((runbook) => (
        <RunbookCard key={runbook.id} runbook={runbook} isTemplate={isTemplate} />
      ))}
    </div>
  );
}

function RunbookCard({ runbook, isTemplate }: { runbook: any; isTemplate: boolean }) {
  const phaseCount = runbook.steps?.reduce((acc: any, step: any) => {
    acc[step.phase] = (acc[step.phase] || 0) + 1;
    return acc;
  }, {}) || {};

  const totalDuration = runbook.steps?.reduce((sum: number, step: any) =>
    sum + (step.estimatedDuration || 0), 0) || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{runbook.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {runbook.description || 'No description provided'}
            </CardDescription>
          </div>
          {isTemplate && (
            <Badge variant="secondary">Template</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Classification Badge */}
          {runbook.classification && (
            <Badge variant="outline" className="capitalize">
              {runbook.classification.replace('_', ' ')}
            </Badge>
          )}

          {/* Phase Indicators */}
          <div className="flex gap-1">
            {PHASES.map((phase) => (
              <div
                key={phase.id}
                className={`h-2 flex-1 rounded ${
                  phaseCount[phase.id] ? phase.color : 'bg-gray-200'
                }`}
                title={`${phase.label}: ${phaseCount[phase.id] || 0} steps`}
              />
            ))}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{Math.round(totalDuration / 60)}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{runbook.steps?.length || 0} steps</span>
            </div>
            {runbook.tags?.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>{runbook.tags.length}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/runbooks/${runbook.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View
              </Button>
            </Link>
            {isTemplate ? (
              <Link href={`/runbooks/new?template=${runbook.id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  Use Template
                </Button>
              </Link>
            ) : (
              <Link href={`/runbooks/${runbook.id}/edit`} className="flex-1">
                <Button size="sm" className="w-full">
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}