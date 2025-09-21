'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Filter,
  Copy,
  Edit,
  Eye,
  Star,
  StarOff,
  Mail,
  Users,
  Shield,
  Megaphone,
  FileText,
  Calendar,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryFilter } from '@/components/communications/CategoryFilter';
import { TemplateCard } from '@/components/communications/TemplateCard';

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: FileText },
  { id: 'internal', label: 'Internal', icon: Users },
  { id: 'customer', label: 'Customer', icon: Mail },
  { id: 'regulatory', label: 'Regulatory', icon: Shield },
  { id: 'media', label: 'Media', icon: Megaphone },
];

export default function CommunicationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/communications/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Use mock data for now
      setTemplates(getMockTemplates());
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        t.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleToggleFavorite = async (templateId: number) => {
    // TODO: Implement favorite toggle
    console.log('Toggle favorite for template:', templateId);
  };

  const handleCloneTemplate = async (templateId: number) => {
    try {
      const response = await fetch(`/api/communications/templates/${templateId}/clone`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to clone template:', error);
    }
  };

  const getMockTemplates = () => [
    {
      id: 1,
      title: 'Initial Customer Notification',
      category: 'customer',
      subject: 'Important Security Update',
      content: 'Dear {{customer.name}},\\n\\nWe are writing to inform you about a security incident: **{{incident.title}}**.\\n\\n## Incident Details\\n- **Severity:** {{incident.severity}}\\n- **Status:** {{incident.status}}\\n- **Detected:** {{incident.detectedAt}}\\n\\n{{incident.description}}\\n\\n## Affected Systems\\n- **Asset:** {{asset.name}}\\n- **Type:** {{asset.type}}\\n- **Impact:** {{incident.impactLevel}}\\n\\nWe are taking this matter seriously and have implemented immediate containment measures.\\n\\nIf you have questions, contact us at {{organization.contact}}.\\n\\nSincerely,\\n{{user.name}}\\n{{user.role}}\\n{{organization.name}}',
      tags: ['incident', 'initial', 'customer'],
      isDefault: true,
      isFavorite: false,
      lastUsed: new Date('2024-01-15'),
      usageCount: 12,
    },
    {
      id: 2,
      title: 'Internal Team Alert',
      category: 'internal',
      subject: 'URGENT: {{incident.severity}} Security Incident - {{incident.title}}',
      content: 'Team,\\n\\n🚨 **URGENT SECURITY INCIDENT DETECTED** 🚨\\n\\n## Incident Summary\\n- **Title:** {{incident.title}}\\n- **Severity:** {{incident.severity}}\\n- **Type:** {{incident.type}}\\n- **Status:** {{incident.status}}\\n- **Detected:** {{incident.detectedAt}}\\n- **Reported By:** {{incident.reportedBy}}\\n\\n## Affected Assets\\n- **Asset:** {{asset.name}} ({{asset.type}})\\n- **Location:** {{asset.location}}\\n- **Criticality:** {{asset.criticality}}\\n- **Owner:** {{asset.owner}}\\n\\n## Description\\n{{incident.description}}\\n\\n## Immediate Actions Required\\n1. Review incident details in the dashboard\\n2. Coordinate response efforts\\n3. Update stakeholders as needed\\n\\n**This is a {{incident.severity}} priority incident. Please respond immediately.**\\n\\nIncident Commander: {{user.name}}\\nGenerated: {{datetime.current}}',
      tags: ['internal', 'urgent', 'team'],
      isDefault: true,
      isFavorite: true,
      lastUsed: new Date('2024-01-20'),
      usageCount: 25,
    },
    {
      id: 3,
      title: 'Regulatory Breach Notification',
      category: 'regulatory',
      subject: 'Data Breach Notification - {{organization.name}}',
      content: 'To Whom It May Concern,\\n\\nPursuant to applicable data protection regulations...',
      tags: ['regulatory', 'breach', 'compliance'],
      isDefault: true,
      isFavorite: false,
      lastUsed: new Date('2024-01-10'),
      usageCount: 3,
    },
    {
      id: 4,
      title: 'Media Statement',
      category: 'media',
      subject: 'Press Release: {{organization.name}} Security Update',
      content: 'FOR IMMEDIATE RELEASE\\n\\n{{organization.name}} today announced...',
      tags: ['media', 'press', 'public'],
      isDefault: false,
      isFavorite: false,
      lastUsed: null,
      usageCount: 0,
    },
  ];

  const getTemplatesByCategory = (category: string) => {
    return category === 'all'
      ? filteredTemplates
      : filteredTemplates.filter(t => t.category === category);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Templates</h1>
          <p className="mt-2 text-muted-foreground">
            Pre-defined templates for incident communications
          </p>
        </div>
        <Button asChild>
          <Link href="/communications/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <CategoryFilter
          categories={TEMPLATE_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          templateCounts={{
            all: templates.length,
            internal: templates.filter(t => t.category === 'internal').length,
            customer: templates.filter(t => t.category === 'customer').length,
            regulatory: templates.filter(t => t.category === 'regulatory').length,
            media: templates.filter(t => t.category === 'media').length,
          }}
        />

        <div className="flex-1">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="recent">Recently Used</TabsTrigger>
              <TabsTrigger value="system">System Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-muted-foreground">Loading templates...</p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <Card>
                  <CardContent className="flex h-64 flex-col items-center justify-center">
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No templates found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                  : 'space-y-4'
                }>
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      viewMode={viewMode}
                      onToggleFavorite={() => handleToggleFavorite(template.id)}
                      onClone={() => handleCloneTemplate(template.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <div className={viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
              }>
                {filteredTemplates.filter(t => t.isFavorite).map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    viewMode={viewMode}
                    onToggleFavorite={() => handleToggleFavorite(template.id)}
                    onClone={() => handleCloneTemplate(template.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className={viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
              }>
                {filteredTemplates
                  .filter(t => t.lastUsed)
                  .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
                  .map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      viewMode={viewMode}
                      onToggleFavorite={() => handleToggleFavorite(template.id)}
                      onClone={() => handleCloneTemplate(template.id)}
                    />
                  ))
                }
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className={viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
              }>
                {filteredTemplates.filter(t => t.isDefault).map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    viewMode={viewMode}
                    onToggleFavorite={() => handleToggleFavorite(template.id)}
                    onClone={() => handleCloneTemplate(template.id)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}