'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Send,
  Copy,
  Download,
  Mail,
  MessageSquare,
  FileText,
  AlertTriangle,
  Check,
  X,
  Eye,
  Code
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TemplateEditor } from '@/components/communications/TemplateEditor';
import { TemplatePreview } from '@/components/communications/TemplatePreview';
import { extractVariables, getDefaultVariableValues, getIncidentVariableData, replaceVariables } from '@/lib/template-variables';
import { cn } from '@/lib/utils';

interface VariableValue {
  key: string;
  value: string;
}

export default function UseTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const incidentId = searchParams.get('incident');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [copySuccess, setCopySuccess] = useState(false);

  const [template, setTemplate] = useState<any>(null);
  const [processedContent, setProcessedContent] = useState('');
  const [processedSubject, setProcessedSubject] = useState('');
  const [variableValues, setVariableValues] = useState<VariableValue[]>([]);
  const [missingVariables, setMissingVariables] = useState<string[]>([]);

  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [recipients, setRecipients] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    fetchTemplateAndData();
  }, [params.id, incidentId]);

  useEffect(() => {
    if (template) {
      processTemplate();
    }
  }, [template, variableValues]);

  const fetchTemplateAndData = async () => {
    try {
      // Fetch template
      const templateResponse = await fetch(`/api/communications/templates/${params.id}`);
      const templateData = templateResponse.ok
        ? await templateResponse.json()
        : getMockTemplate();

      setTemplate(templateData);

      // Fetch incident data if incidentId is provided
      let incidentData = null;
      if (incidentId) {
        const incidentResponse = await fetch(`/api/incidents/${incidentId}`);
        incidentData = incidentResponse.ok
          ? await incidentResponse.json()
          : getMockIncident();
      }

      // Initialize variable values
      const initialValues = getInitialVariableValues(templateData, incidentData);
      setVariableValues(initialValues);

    } catch (error) {
      console.error('Error fetching data:', error);
      setTemplate(getMockTemplate());
      setVariableValues(getInitialVariableValues(getMockTemplate(), getMockIncident()));
    } finally {
      setLoading(false);
    }
  };

  const getMockTemplate = () => ({
    id: parseInt(params.id),
    title: 'Customer Data Breach Notification',
    category: 'customer',
    subject: 'Important Security Update - {{organization.name}}',
    content: `Dear {{customer.name}},

We are writing to inform you about a security incident: **{{incident.title}}**.

## Incident Details
- **Severity:** {{incident.severity}}
- **Status:** {{incident.status}}
- **Detected:** {{incident.detectedAt}}
- **Type:** {{incident.type}}
- **Impact Level:** {{incident.impactLevel}}

{{incident.description}}

## Affected Systems
- **Asset:** {{asset.name}} ({{asset.type}})
- **Location:** {{asset.location}}
- **Criticality:** {{asset.criticality}}
- **Data Classification:** {{asset.dataClassification}}
- **Affected Records:** {{asset.affectedRecords}}

## Actions Taken
We have implemented immediate security measures to contain and resolve this issue. The incident was contained at {{incident.containedAt}}.

## What You Should Do
1. Monitor your accounts for any suspicious activity
2. Change your password on our platform immediately
3. Enable two-factor authentication if not already active
4. Review your account activity for the past 30 days

## Contact Information
If you have any questions or concerns, please contact our security team:
- **Email:** {{organization.contact}}
- **Phone:** {{organization.phone}}
- **Website:** {{organization.website}}

**Response Deadline:** {{datetime.deadline}}

Sincerely,

{{user.signature}}

---
**{{organization.name}}**
{{organization.address}}
This communication was generated on {{datetime.reportDate}}`,
    tags: ['customer', 'breach', 'notification'],
  });

  const getMockIncident = () => ({
    id: 1,
    title: 'Unauthorized Database Access',
    severity: 'Critical',
    status: 'Contained',
    detectedAt: '2024-01-20 14:30 UTC',
    description: 'Unauthorized access to customer database detected through compromised credentials.',
  });

  const getInitialVariableValues = (template: any, incident: any) => {
    const values: VariableValue[] = [];

    // Extract variables from template content and subject
    const variables = extractVariables(template.content, template.subject);

    // Get default variable data with incident context
    const variableData = getIncidentVariableData(incident);

    variables.forEach(variableKey => {
      let value = '';

      // Parse variable path
      const [category, field] = variableKey.split('.');

      if (category && field && variableData[category as keyof typeof variableData]) {
        const categoryData = variableData[category as keyof typeof variableData] as Record<string, any>;
        value = categoryData[field] || '';
      }

      // Add customer name placeholder for demo
      if (variableKey === 'customer.name') {
        value = '[Customer Name]';
      }

      values.push({ key: variableKey, value });
    });

    return values;
  };

  const processTemplate = () => {
    if (!template) return;

    // Build custom values map from current variable values
    const customValues: Record<string, string> = {};
    variableValues.forEach(({ key, value }) => {
      if (value !== undefined && value !== null) {
        customValues[key] = value;
      }
    });

    // Get default variable data as fallback
    const defaultData = getDefaultVariableValues();

    // Process content with both custom values and defaults
    const contentResult = replaceVariables(template.content, defaultData, customValues);
    const subjectResult = replaceVariables(template.subject || '', defaultData, customValues);

    setProcessedContent(contentResult.content);
    setProcessedSubject(subjectResult.content);
    setMissingVariables([...new Set([...contentResult.missingVariables, ...subjectResult.missingVariables])]);
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev =>
      prev.map(v => v.key === key ? { ...v, value } : v)
    );
  };

  const handleCopy = async () => {
    try {
      const textToCopy = processedSubject
        ? `Subject: ${processedSubject}\n\n${processedContent}`
        : processedContent;

      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExport = () => {
    const blob = new Blob([processedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!recipients.trim() || missingVariables.length > 0) return;

    setSending(true);
    try {
      const response = await fetch(`/api/communications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          incidentId: incidentId ? parseInt(incidentId) : null,
          method: deliveryMethod,
          recipients: recipients.split(',').map(r => r.trim()),
          subject: processedSubject,
          content: processedContent,
          notes: additionalNotes,
        }),
      });

      if (response.ok) {
        router.push(incidentId ? `/incidents/${incidentId}` : '/communications');
      }
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Loading template...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href={incidentId ? `/incidents/${incidentId}` : `/communications/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Use Template</h1>
            <p className="mt-1 text-muted-foreground">
              {template?.title}
              {incidentId && ' - Linked to incident'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
          >
            {copySuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={handleSend}
            disabled={!recipients.trim() || missingVariables.length > 0 || sending}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Communication
          </Button>
        </div>
      </div>

      {missingVariables.length > 0 && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Variables</AlertTitle>
          <AlertDescription>
            Please fill in all required variables before sending:
            <div className="mt-2 flex flex-wrap gap-2">
              {missingVariables.map(v => (
                <Badge key={v} variant="destructive">{v}</Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>
                Configure how to send this communication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method">Delivery Method</Label>
                <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="manual">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Manual (Copy/Paste)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">
                  Recipients * {deliveryMethod === 'email' && '(comma-separated emails)'}
                </Label>
                <Input
                  id="recipients"
                  placeholder={
                    deliveryMethod === 'email'
                      ? 'john@example.com, jane@example.com'
                      : 'Enter recipients...'
                  }
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Internal notes about this communication..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
              <CardDescription>
                Review and finalize your message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="edit">
                    <Code className="mr-2 h-4 w-4" />
                    Edit
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <TemplatePreview
                    subject={processedSubject}
                    content={processedContent}
                    showVariables={false}
                  />
                </TabsContent>
                <TabsContent value="edit" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Input
                      id="edit-subject"
                      value={processedSubject}
                      onChange={(e) => setProcessedSubject(e.target.value)}
                    />
                  </div>
                  <TemplateEditor
                    content={processedContent}
                    onChange={setProcessedContent}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>
                Fill in the values for template variables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {variableValues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No variables found in this template</p>
                </div>
              ) : (
                variableValues.map(({ key, value }) => {
                  const [category, field] = key.split('.');
                  const isEmpty = !value || value.trim() === '';

                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm flex items-center gap-2">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {`{{${key}}}`}
                        </code>
                        {category && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {category}
                          </Badge>
                        )}
                      </Label>
                      <Input
                        id={key}
                        value={value}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        placeholder={`Enter ${field || key}...`}
                        className={cn(
                          isEmpty && 'border-destructive focus:border-destructive'
                        )}
                      />
                      {isEmpty && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          This field is required
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {incidentId && (
            <Card>
              <CardHeader>
                <CardTitle>Incident Context</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This communication is linked to incident #{incidentId}.
                  Incident data has been automatically populated in the template variables.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  asChild
                >
                  <Link href={`/incidents/${incidentId}`}>
                    View Incident
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}