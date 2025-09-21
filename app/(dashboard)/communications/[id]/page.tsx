import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplatePreview } from '@/components/communications/TemplatePreview';
import { TemplateVersionHistory } from '@/components/communications/TemplateVersionHistory';
import {
  ArrowLeft,
  Edit,
  Copy,
  Download,
  Trash2,
  Star,
  StarOff,
  Mail,
  Users,
  Shield,
  Megaphone,
  Clock,
  BarChart,
  FileText,
  Play,
  History
} from 'lucide-react';
import { db } from '@/lib/db';
import { communicationTemplates } from '@/lib/db/schema-ir';
import { eq } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'View Template - Communications',
  description: 'View communication template details',
};

const CATEGORY_ICONS = {
  internal: Users,
  customer: Mail,
  regulatory: Shield,
  media: Megaphone,
};

const AVAILABLE_VARIABLES = {
  incident: [
    { key: 'incident.title', label: 'Incident Title', example: 'Data Breach Investigation' },
    { key: 'incident.severity', label: 'Severity', example: 'Critical' },
    { key: 'incident.status', label: 'Status', example: 'Contained' },
    { key: 'incident.detectedAt', label: 'Detection Time', example: '2024-01-20 14:30 UTC' },
    { key: 'incident.description', label: 'Description', example: 'Unauthorized access detected...' },
  ],
  organization: [
    { key: 'organization.name', label: 'Organization Name', example: 'Acme Corporation' },
    { key: 'organization.contact', label: 'Contact Email', example: 'security@acme.com' },
    { key: 'organization.phone', label: 'Contact Phone', example: '+1-555-0100' },
    { key: 'organization.website', label: 'Website', example: 'https://acme.com' },
  ],
  user: [
    { key: 'user.name', label: 'Current User', example: 'John Doe' },
    { key: 'user.email', label: 'User Email', example: 'john@acme.com' },
    { key: 'user.role', label: 'User Role', example: 'Security Analyst' },
  ],
  datetime: [
    { key: 'datetime.current', label: 'Current Date/Time', example: '2024-01-20 15:45 UTC' },
    { key: 'datetime.date', label: 'Current Date', example: '2024-01-20' },
    { key: 'datetime.time', label: 'Current Time', example: '15:45 UTC' },
  ],
};

async function getTemplate(id: string) {
  try {
    const template = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.id, parseInt(id)))
      .limit(1);

    return template[0];
  } catch (error) {
    console.error('Error fetching template:', error);
    // Return mock data for development
    return getMockTemplate(parseInt(id));
  }
}

function getMockTemplate(id: number) {
  return {
    id,
    title: 'Customer Data Breach Notification',
    category: 'customer' as const,
    subject: 'Important Security Update - {{organization.name}}',
    content: `Dear {{customer.name}},

We are writing to inform you about a security incident that may have affected your personal information.

**What Happened:**
On {{incident.detectedAt}}, we discovered unauthorized access to our systems. Our security team immediately initiated our incident response protocol and began a thorough investigation.

**Information Involved:**
The incident may have exposed the following types of information:
- Names and email addresses
- Account information
- Transaction history

**What We Are Doing:**
- We have contained the incident and secured our systems
- We are working with law enforcement and cybersecurity experts
- We have implemented additional security measures
- We are offering free credit monitoring services to affected customers

**What You Should Do:**
1. Monitor your accounts for any suspicious activity
2. Change your password on our platform
3. Enable two-factor authentication
4. Review the security resources we've provided

**For More Information:**
If you have any questions or concerns, please contact our dedicated support team at {{organization.contact}} or call {{organization.phone}}.

We take the security of your information seriously and apologize for any inconvenience this may cause.

Sincerely,
{{user.name}}
{{user.role}}
{{organization.name}}`,
    tags: ['customer', 'breach', 'notification', 'urgent'],
    isDefault: false,
    organizationId: 1,
    createdBy: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };
}

function getMockVersionHistory() {
  return [
    {
      id: 1,
      version: '1.2',
      changedBy: 'John Doe',
      changedAt: new Date('2024-01-15'),
      changes: 'Updated contact information and added credit monitoring section',
    },
    {
      id: 2,
      version: '1.1',
      changedBy: 'Jane Smith',
      changedAt: new Date('2024-01-10'),
      changes: 'Added two-factor authentication instructions',
    },
    {
      id: 3,
      version: '1.0',
      changedBy: 'John Doe',
      changedAt: new Date('2024-01-01'),
      changes: 'Initial template creation',
    },
  ];
}

function getMockUsageStats() {
  return {
    totalUsage: 24,
    lastUsed: new Date('2024-01-20'),
    averageResponseTime: '45 minutes',
    incidents: [
      { id: 1, title: 'Q4 2023 Data Breach', date: new Date('2024-01-20') },
      { id: 2, title: 'Account Compromise Investigation', date: new Date('2024-01-15') },
      { id: 3, title: 'Phishing Campaign Response', date: new Date('2024-01-10') },
    ],
  };
}

export default async function ViewTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const template = await getTemplate(params.id);

  if (!template) {
    notFound();
  }

  const CategoryIcon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || FileText;
  const versionHistory = getMockVersionHistory();
  const usageStats = getMockUsageStats();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/communications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{template.title}</h1>
              {template.isDefault && (
                <Badge variant="secondary">System Template</Badge>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CategoryIcon className="h-4 w-4" />
                <span className="capitalize">{template.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Last updated {new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                <span>Used {usageStats.totalUsage} times</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/communications/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/communications/${params.id}/use`}>
              <Play className="mr-2 h-4 w-4" />
              Use Template
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>
                Preview with sample data replacing variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplatePreview
                subject={template.subject}
                content={template.content}
                variables={AVAILABLE_VARIABLES}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subject Line</p>
                <p className="mt-1">{template.subject || 'No subject defined'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(template.tags as string[] || []).map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Raw Content</p>
                <pre className="mt-2 rounded bg-muted p-4 text-sm overflow-x-auto">
                  <code>{template.content}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
              <CardDescription>
                These variables can be used in this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(AVAILABLE_VARIABLES).map(([category, vars]) => (
                  <div key={category}>
                    <h4 className="mb-2 text-sm font-medium capitalize">{category}</h4>
                    <div className="space-y-1">
                      {vars.map((v) => (
                        <div key={v.key} className="flex items-center justify-between rounded p-2 hover:bg-muted">
                          <code className="text-sm">{`{{${v.key}}}`}</code>
                          <span className="text-sm text-muted-foreground">{v.example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <TemplateVersionHistory versions={versionHistory} />
        </TabsContent>

        <TabsContent value="usage" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{usageStats.totalUsage}</p>
                <p className="text-xs text-muted-foreground">Times used</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Last Used</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {usageStats.lastUsed.toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {usageStats.lastUsed.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{usageStats.averageResponseTime}</p>
                <p className="text-xs text-muted-foreground">After incident detection</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Usage</CardTitle>
              <CardDescription>
                Incidents where this template was used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usageStats.incidents.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.date.toLocaleDateString()} at {incident.date.toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/incidents/${incident.id}`}>
                        View Incident
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}