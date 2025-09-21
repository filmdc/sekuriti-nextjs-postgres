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
  Megaphone
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
        textarea.selectionStart = textarea.selectionEnd = start + variable.length + 4;
        textarea.focus();
      }, 0);
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
                  <p className="font-medium">Use Variables</p>
                  <p className="text-muted-foreground">
                    Insert dynamic content with {'{{variable}}'} syntax
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Markdown Support</p>
                  <p className="text-muted-foreground">
                    Format text with **bold**, *italic*, and [links](url)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Categories</p>
                  <p className="text-muted-foreground">
                    Choose the right category for better organization
                  </p>
                </div>
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