'use client';

import { useState, useEffect } from 'react';
import { useTemplates } from '@/lib/hooks/useTemplates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  FileText,
  Star,
  Clock,
  Filter,
  ChevronRight,
  Copy,
  Eye,
  Sparkles,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TemplateSelectorProps {
  type: 'runbook' | 'communication';
  category?: string;
  onSelect: (template: any) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function TemplateSelector({
  type,
  category,
  onSelect,
  trigger,
  className,
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { templates, systemTemplates, orgTemplates, isLoading, error } = useTemplates(
    type,
    {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search,
      includeSystem: true,
    }
  );

  const handleSelectTemplate = (template: any) => {
    onSelect(template);
    setOpen(false);
  };

  const handlePreview = (template: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const categories = type === 'communication'
    ? [
        { value: 'all', label: 'All Templates' },
        { value: 'initial', label: 'Initial Response' },
        { value: 'status_update', label: 'Status Update' },
        { value: 'resolution', label: 'Resolution' },
        { value: 'stakeholder', label: 'Stakeholder' },
        { value: 'technical', label: 'Technical' },
        { value: 'executive', label: 'Executive' },
      ]
    : [
        { value: 'all', label: 'All Templates' },
        { value: 'incident_response', label: 'Incident Response' },
        { value: 'disaster_recovery', label: 'Disaster Recovery' },
        { value: 'security', label: 'Security' },
        { value: 'compliance', label: 'Compliance' },
        { value: 'operational', label: 'Operational' },
      ];

  const TemplateCard = ({ template, isSystem }: { template: any; isSystem: boolean }) => (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        'hover:border-primary/50'
      )}
      onClick={() => handleSelectTemplate(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {template.title}
              {isSystem && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  System
                </Badge>
              )}
              {template.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {template.category}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => handlePreview(template, e)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectTemplate(template);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.subject || template.description || template.content.substring(0, 100)}
        </p>
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {template.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {template.usageCount && (
            <span className="flex items-center gap-1">
              <Copy className="h-3 w-3" />
              {template.usageCount} uses
            </span>
          )}
          {template.lastUsed && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(template.lastUsed), 'MMM d')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className={className}>
              <FileText className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select a Template</DialogTitle>
            <DialogDescription>
              Choose a template to start with or create from scratch
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Templates Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All Templates ({templates.length})
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Sparkles className="h-4 w-4 mr-1" />
                  System ({systemTemplates.length})
                </TabsTrigger>
                <TabsTrigger value="organization">
                  <Building className="h-4 w-4 mr-1" />
                  Organization ({orgTemplates.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Failed to load templates. Please try again.
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No templates found. Try adjusting your filters.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {templates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSystem={!template.organizationId}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="system" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {systemTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No system templates available.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {systemTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSystem={true}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="organization" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {orgTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No organization templates yet. Create your first template!
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {orgTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSystem={false}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              {previewTemplate?.title}
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              {previewTemplate.subject && (
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {previewTemplate.subject}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Content</label>
                <ScrollArea className="h-[300px] mt-2 p-4 border rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {previewTemplate.content}
                  </pre>
                </ScrollArea>
              </div>
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Variables</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewTemplate.variables.map((variable: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleSelectTemplate(previewTemplate);
                    setShowPreview(false);
                  }}
                >
                  Use This Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}