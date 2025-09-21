'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Zap, Tag as TagIcon, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagSelector } from './tag-selector';
import { useToast } from '@/components/ui/use-toast';
import type { Tag } from '@/lib/db/schema-tags';

interface TagTemplate {
  id: number;
  name: string;
  description?: string;
  tags: Tag[];
  entityType?: string;
  isDefault: boolean;
}

interface TagTemplatesProps {
  availableTags: Tag[];
  onApplyTemplate: (tagIds: number[]) => void;
  assetType?: string;
  className?: string;
}

export function TagTemplates({
  availableTags,
  onApplyTemplate,
  assetType,
  className
}: TagTemplatesProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TagTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    selectedTags: [] as number[]
  });

  // Fetch tag templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/organization/tags/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error('Error fetching tag templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim() || newTemplate.selectedTags.length === 0) {
      toast({
        title: 'Error',
        description: 'Please provide a name and select at least one tag',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/organization/tags/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplate.name,
          description: newTemplate.description,
          tags: newTemplate.selectedTags,
          entityType: assetType
        })
      });

      if (response.ok) {
        const template = await response.json();
        setTemplates([...templates, template]);
        setShowCreateDialog(false);
        setNewTemplate({
          name: '',
          description: '',
          selectedTags: []
        });
        toast({
          title: 'Success',
          description: 'Template created successfully'
        });
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive'
      });
    }
  };

  const handleApplyTemplate = (template: TagTemplate) => {
    const tagIds = template.tags.map(tag => tag.id);
    onApplyTemplate(tagIds);
    toast({
      title: 'Template applied',
      description: `Applied ${template.name} template with ${tagIds.length} tags`
    });
  };

  // Filter templates relevant to the current asset type
  const relevantTemplates = templates.filter(template =>
    !template.entityType || template.entityType === assetType || template.isDefault
  );

  // Get quick tag suggestions based on asset type
  const getQuickSuggestions = () => {
    const suggestions: Record<string, number[]> = {};

    // Find commonly used tag combinations
    const criticalityTags = availableTags.filter(tag => tag.category === 'criticality');
    const departmentTags = availableTags.filter(tag => tag.category === 'department');
    const locationTags = availableTags.filter(tag => tag.category === 'location');

    if (criticalityTags.length > 0) {
      suggestions['Critical Assets'] = criticalityTags
        .filter(tag => tag.name.toLowerCase().includes('critical') || tag.name.toLowerCase().includes('high'))
        .map(tag => tag.id);
    }

    if (departmentTags.length > 0) {
      suggestions['IT Department'] = departmentTags
        .filter(tag => tag.name.toLowerCase().includes('it') || tag.name.toLowerCase().includes('technology'))
        .map(tag => tag.id);
    }

    return suggestions;
  };

  const quickSuggestions = getQuickSuggestions();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Tag Templates
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Tag Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable template for quickly applying tag combinations.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Production Server Tags"
                    />
                  </div>

                  <div>
                    <Label htmlFor="templateDescription">Description (Optional)</Label>
                    <Textarea
                      id="templateDescription"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe when to use this template"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Select Tags for Template</Label>
                    <TagSelector
                      availableTags={availableTags}
                      selectedTags={newTemplate.selectedTags}
                      onTagsChange={(tagIds) => setNewTemplate(prev => ({ ...prev, selectedTags: tagIds }))}
                      placeholder="Choose tags for this template..."
                      multiple={true}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Suggestions */}
          {Object.keys(quickSuggestions).length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Quick Suggestions
              </h4>
              <div className="space-y-2">
                {Object.entries(quickSuggestions).map(([name, tagIds]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onApplyTemplate(tagIds)}
                  >
                    <TagIcon className="h-3 w-3 mr-2" />
                    {name}
                    <Badge variant="secondary" className="ml-auto">
                      {tagIds.length} tags
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Templates */}
          {relevantTemplates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Custom Templates
              </h4>
              <div className="space-y-2">
                {relevantTemplates.map(template => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{template.name}</h5>
                        {template.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                              color: tag.color
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relevantTemplates.length === 0 && Object.keys(quickSuggestions).length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No templates available</p>
              <p className="text-xs">Create a template to quickly apply tag combinations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}