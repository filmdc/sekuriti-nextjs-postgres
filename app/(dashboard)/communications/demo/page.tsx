'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateEditor } from '@/components/communications/TemplateEditor';
import { VariablePicker } from '@/components/communications/VariablePicker';
import { TemplatePreview } from '@/components/communications/TemplatePreview';
import {
  ArrowLeft,
  CheckCircle,
  Code,
  Eye,
  Sparkles,
  Zap
} from 'lucide-react';

const DEMO_VARIABLES = {
  incident: [
    { key: 'incident.title', label: 'Incident Title', example: 'Critical Database Breach' },
    { key: 'incident.severity', label: 'Severity Level', example: 'Critical' },
    { key: 'incident.status', label: 'Current Status', example: 'Contained' },
    { key: 'incident.detectedAt', label: 'Detection Time', example: '2024-01-20 14:30 UTC' },
    { key: 'incident.description', label: 'Incident Description', example: 'Unauthorized access detected through compromised credentials' },
  ],
  organization: [
    { key: 'organization.name', label: 'Organization Name', example: 'Acme Corporation' },
    { key: 'organization.contact', label: 'Security Contact Email', example: 'security@acme.com' },
    { key: 'organization.phone', label: 'Contact Phone', example: '+1-555-0100' },
  ],
  user: [
    { key: 'user.name', label: 'Current User Name', example: 'John Doe' },
    { key: 'user.email', label: 'User Email', example: 'john.doe@acme.com' },
    { key: 'user.role', label: 'User Role/Title', example: 'Senior Security Analyst' },
  ],
  asset: [
    { key: 'asset.name', label: 'Asset Name', example: 'Customer Database Server' },
    { key: 'asset.type', label: 'Asset Type', example: 'Database Server' },
    { key: 'asset.criticality', label: 'Business Criticality', example: 'Critical' },
  ],
  datetime: [
    { key: 'datetime.current', label: 'Current Date & Time', example: '2024-01-20 15:45 UTC' },
    { key: 'datetime.date', label: 'Current Date', example: '2024-01-20' },
    { key: 'datetime.reportDate', label: 'Report Date', example: 'January 20, 2024' },
  ],
};

const DEMO_TEMPLATE = `## Security Incident Notification

Dear {{organization.name}} Team,

We are writing to inform you about a **{{incident.severity}}** security incident: **{{incident.title}}**.

### Incident Details
- **Status:** {{incident.status}}
- **Detected:** {{incident.detectedAt}}
- **Asset:** {{asset.name}} ({{asset.type}})

### Description
{{incident.description}}

### Contact Information
Please contact {{organization.contact}} if you have questions.

Best regards,
{{user.name}}
{{user.role}}
{{organization.name}} Security Team

Generated on {{datetime.reportDate}}`;

export default function CommunicationsDemoPage() {
  const [content, setContent] = useState(DEMO_TEMPLATE);
  const [activeTab, setActiveTab] = useState('edit');

  const handleInsertVariable = (variable: string) => {
    console.log('Variable selected:', variable);
  };

  const features = [
    {
      icon: Zap,
      title: 'Smart Autocomplete',
      description: 'Type {{ to trigger intelligent variable suggestions with real-time search',
    },
    {
      icon: Eye,
      title: 'Live Preview',
      description: 'See your template with example data instantly as you type',
    },
    {
      icon: Code,
      title: 'Rich Formatting',
      description: 'Support for markdown formatting including bold, italic, links, and lists',
    },
    {
      icon: CheckCircle,
      title: 'Variable Validation',
      description: 'Automatic detection and highlighting of missing or invalid variables',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/communications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Template Variable System Demo
            </h1>
            <p className="mt-1 text-muted-foreground">
              Interactive demonstration of the enhanced communication template variable system
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/communications/new">
            Try Creating Your Own Template
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <feature.icon className="h-5 w-5 text-primary" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Template Editor</CardTitle>
              <CardDescription>
                Try editing the template below. Type <code>{'{{'}</code> to see the autocomplete in action!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">
                    <Code className="mr-2 h-4 w-4" />
                    Edit Template
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Live Preview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="space-y-4">
                  <TemplateEditor
                    content={content}
                    onChange={setContent}
                    onInsertVariable={handleInsertVariable}
                    variables={DEMO_VARIABLES}
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <TemplatePreview
                    content={content}
                    variables={DEMO_VARIABLES}
                    showVariables={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>✅ Key Improvements Made</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    🔧 Fixed Issues
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Variable insertion now works properly
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Autocomplete positioning fixed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Preview rendering improved
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Variable validation enhanced
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    ✨ New Features
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Smart variable search & ranking
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Keyboard navigation in autocomplete
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Better visual feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Improved markdown rendering
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <VariablePicker
            variables={DEMO_VARIABLES}
            onSelectVariable={handleInsertVariable}
          />

          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 min-w-[24px] justify-center">1</Badge>
                  <div>
                    <p className="font-medium">Type <code>{'{{'}</code> in the editor</p>
                    <p className="text-muted-foreground">This triggers the autocomplete dropdown</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 min-w-[24px] justify-center">2</Badge>
                  <div>
                    <p className="font-medium">Use arrow keys to navigate</p>
                    <p className="text-muted-foreground">Press Enter to insert selected variable</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 min-w-[24px] justify-center">3</Badge>
                  <div>
                    <p className="font-medium">Click variables on the right</p>
                    <p className="text-muted-foreground">Or use the variable picker panel</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 min-w-[24px] justify-center">4</Badge>
                  <div>
                    <p className="font-medium">Switch to preview tab</p>
                    <p className="text-muted-foreground">See variables replaced with example data</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}