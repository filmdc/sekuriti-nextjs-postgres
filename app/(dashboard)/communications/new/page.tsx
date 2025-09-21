'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { TemplateEditor } from '@/components/communications/TemplateEditor';
import { VariablePicker } from '@/components/communications/VariablePicker';
import { TemplatePreview } from '@/components/communications/TemplatePreview';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  X,
  Plus,
  Info,
  FileText,
  Users,
  Mail,
  Shield,
  Megaphone,
  HardDrive
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TEMPLATE_CATEGORIES = [
  { value: 'internal', label: 'Internal', icon: Users },
  { value: 'customer', label: 'Customer', icon: Mail },
  { value: 'regulatory', label: 'Regulatory', icon: Shield },
  { value: 'media', label: 'Media', icon: Megaphone },
];

const AVAILABLE_VARIABLES = {
  incident: [
    { key: 'incident.title', label: 'Incident Title', example: 'Data Breach Investigation' },
    { key: 'incident.severity', label: 'Severity Level', example: 'Critical' },
    { key: 'incident.status', label: 'Current Status', example: 'Contained' },
    { key: 'incident.detectedAt', label: 'Detection Time', example: '2024-01-20 14:30 UTC' },
    { key: 'incident.description', label: 'Incident Description', example: 'Unauthorized access detected through compromised credentials' },
    { key: 'incident.type', label: 'Incident Type', example: 'Data Breach' },
    { key: 'incident.impactLevel', label: 'Impact Level', example: 'High' },
    { key: 'incident.affectedUsers', label: 'Affected Users Count', example: '1,247' },
    { key: 'incident.containedAt', label: 'Containment Time', example: '2024-01-20 16:15 UTC' },
    { key: 'incident.reportedBy', label: 'Reported By', example: 'Security Team' },
  ],
  organization: [
    { key: 'organization.name', label: 'Organization Name', example: 'Acme Corporation' },
    { key: 'organization.contact', label: 'Security Contact Email', example: 'security@acme.com' },
    { key: 'organization.phone', label: 'Contact Phone', example: '+1-555-0100' },
    { key: 'organization.website', label: 'Company Website', example: 'https://acme.com' },
    { key: 'organization.address', label: 'Company Address', example: '123 Business Ave, City, State 12345' },
    { key: 'organization.industry', label: 'Industry', example: 'Technology' },
    { key: 'organization.complianceOfficer', label: 'Compliance Officer', example: 'Jane Smith' },
  ],
  user: [
    { key: 'user.name', label: 'Current User Name', example: 'John Doe' },
    { key: 'user.email', label: 'User Email', example: 'john.doe@acme.com' },
    { key: 'user.role', label: 'User Role/Title', example: 'Senior Security Analyst' },
    { key: 'user.department', label: 'Department', example: 'Information Security' },
    { key: 'user.phone', label: 'User Phone', example: '+1-555-0123' },
    { key: 'user.signature', label: 'Email Signature', example: 'Best regards,\nJohn Doe\nSenior Security Analyst' },
  ],
  asset: [
    { key: 'asset.name', label: 'Asset Name', example: 'Customer Database Server' },
    { key: 'asset.type', label: 'Asset Type', example: 'Database Server' },
    { key: 'asset.criticality', label: 'Business Criticality', example: 'Critical' },
    { key: 'asset.owner', label: 'Asset Owner', example: 'Data Team' },
    { key: 'asset.location', label: 'Physical/Cloud Location', example: 'AWS US-East-1' },
    { key: 'asset.dataClassification', label: 'Data Classification', example: 'Confidential' },
    { key: 'asset.affectedRecords', label: 'Affected Records', example: '15,000 customer records' },
  ],
  datetime: [
    { key: 'datetime.current', label: 'Current Date & Time', example: '2024-01-20 15:45 UTC' },
    { key: 'datetime.date', label: 'Current Date', example: '2024-01-20' },
    { key: 'datetime.time', label: 'Current Time', example: '15:45 UTC' },
    { key: 'datetime.timestamp', label: 'Unix Timestamp', example: '1705764300' },
    { key: 'datetime.reportDate', label: 'Report Date', example: 'January 20, 2024' },
    { key: 'datetime.deadline', label: 'Response Deadline', example: '72 hours from detection' },
  ],
};

export default function NewCommunicationTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subject: '',
    content: '',
    tags: [] as string[],
    isDefault: false,
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleInsertVariable = (variable: string) => {
    // This function is called when a variable is selected from the VariablePicker
    // The TemplateEditor component now handles insertion internally via autocomplete
    // But we still need this for the legacy variable picker component
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newContent = before + `{{${variable}}}` + after;
      handleInputChange('content', newContent);

      // Set cursor position after the inserted variable
      setTimeout(() => {
        const newCursorPos = start + variable.length + 4;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 10);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/communications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/communications/${data.id}`);
      } else {
        console.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      router.push('/communications');
    }
  };

  const validateForm = () => {
    return (
      formData.title.trim() &&
      formData.category &&
      formData.content.trim()
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Communication Template</h1>
            <p className="mt-1 text-muted-foreground">
              Create a reusable template for incident communications
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!validateForm() || loading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Basic information about your communication template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Template Name *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Customer Breach Notification"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject (Optional)</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Important Security Update - {{organization.name}}"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use for email templates. Supports variables.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="default">System Default Template</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this a default template for all organizations
                  </p>
                </div>
                <Switch
                  id="default"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
              <CardDescription>
                Write your template content with support for variables and markdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">
                    <Code className="mr-2 h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="space-y-4">
                  <TemplateEditor
                    content={formData.content}
                    onChange={(content) => handleInputChange('content', content)}
                    onInsertVariable={handleInsertVariable}
                    variables={AVAILABLE_VARIABLES}
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <TemplatePreview
                    subject={formData.subject}
                    content={formData.content}
                    variables={AVAILABLE_VARIABLES}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <VariablePicker
            variables={AVAILABLE_VARIABLES}
            onSelectVariable={handleInsertVariable}
          />

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Smart Variables</p>
                  <p className="text-muted-foreground">
                    Type {'{{'} to trigger autocomplete, or click variables on the right
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Rich Formatting</p>
                  <p className="text-muted-foreground">
                    Use **bold**, *italic*, ## headings, and [links](url)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Live Preview</p>
                  <p className="text-muted-foreground">
                    Switch to preview tab to see variables replaced with examples
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Categories</p>
                  <p className="text-muted-foreground">
                    Incident, Organization, User, Asset, and DateTime variables
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Template</CardTitle>
              <CardDescription>
                Copy this example to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => {
                    const sampleTemplate = `## Security Incident Notification

Dear {{customer.name}},

We are writing to inform you about a **{{incident.severity}}** security incident: **{{incident.title}}**.

### Incident Details
- **Type:** {{incident.type}}
- **Status:** {{incident.status}}
- **Detected:** {{incident.detectedAt}}
- **Impact Level:** {{incident.impactLevel}}

### Description
{{incident.description}}

### Affected Systems
- **Asset:** {{asset.name}} ({{asset.type}})
- **Location:** {{asset.location}}
- **Data Classification:** {{asset.dataClassification}}
- **Records Affected:** {{asset.affectedRecords}}

### Our Response
We detected this incident at {{incident.detectedAt}} and successfully contained it by {{incident.containedAt}}. Our security team has implemented additional protective measures.

### What You Should Do
1. **Change your password** immediately
2. **Enable two-factor authentication** if not already active
3. **Monitor your account** for suspicious activity
4. **Contact us** if you notice anything unusual

### Contact Information
If you have any questions or concerns:
- **Email:** {{organization.contact}}
- **Phone:** {{organization.phone}}
- **Website:** {{organization.website}}

We sincerely apologize for any inconvenience and appreciate your understanding.

{{user.signature}}

---
**{{organization.name}}** | {{organization.address}}
*Report generated on {{datetime.reportDate}}*`;
                    handleInputChange('content', sampleTemplate);
                    handleInputChange('subject', 'Security Incident Notification - {{incident.title}}');
                    handleInputChange('title', 'Comprehensive Security Incident Template');
                  }}
                >
                  Load Sample Template
                </Button>
                <p className="text-xs text-muted-foreground">
                  This template demonstrates all variable categories and markdown formatting
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push('/communications')}
              className="bg-destructive text-destructive-foreground"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}