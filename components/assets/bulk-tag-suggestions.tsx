'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Tag as TagIcon, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Asset } from '@/lib/db/schema-ir';
import type { Tag } from '@/lib/db/schema-tags';

interface BulkTagSuggestionsProps {
  selectedAssets: Array<Asset & { tags?: Tag[] }>;
  availableTags: Tag[];
  onApplySuggestion: (tagIds: number[], description: string) => void;
  className?: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  tagIds: number[];
  confidence: number;
  reason: string;
  category: 'common' | 'missing' | 'consistency' | 'best-practice';
}

export function BulkTagSuggestions({
  selectedAssets,
  availableTags,
  onApplySuggestion,
  className
}: BulkTagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (selectedAssets.length === 0) {
      setSuggestions([]);
      return;
    }

    const generateSuggestions = () => {
      const newSuggestions: Suggestion[] = [];

      // Analyze asset types
      const assetTypes = selectedAssets.map(asset => asset.type);
      const uniqueTypes = Array.from(new Set(assetTypes));

      // Common tags across assets
      const allExistingTags = selectedAssets.flatMap(asset => asset.tags || []);
      const tagCounts = allExistingTags.reduce((acc, tag) => {
        acc[tag.id] = (acc[tag.id] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Find commonly used tags that aren't on all assets
      Object.entries(tagCounts).forEach(([tagIdStr, count]) => {
        const tagId = parseInt(tagIdStr);
        const tag = availableTags.find(t => t.id === tagId);
        if (!tag) return;

        const coverage = count / selectedAssets.length;
        if (coverage > 0.3 && coverage < 1) {
          newSuggestions.push({
            id: `common-${tagId}`,
            title: `Apply "${tag.name}" to all assets`,
            description: `${count} of ${selectedAssets.length} assets already have this tag`,
            tagIds: [tagId],
            confidence: coverage * 100,
            reason: `Common tag with ${coverage.toFixed(0)}% coverage`,
            category: 'common'
          });
        }
      });

      // Missing criticality tags
      const criticalityTags = availableTags.filter(tag => tag.category === 'criticality');
      const assetsWithoutCriticality = selectedAssets.filter(asset =>
        !asset.tags?.some(tag => tag.category === 'criticality')
      );

      if (assetsWithoutCriticality.length > 0 && criticalityTags.length > 0) {
        // Suggest based on asset type
        const suggestedCriticalityTag = uniqueTypes.includes('hardware') || uniqueTypes.includes('service')
          ? criticalityTags.find(tag => tag.name.toLowerCase().includes('high') || tag.name.toLowerCase().includes('critical'))
          : criticalityTags.find(tag => tag.name.toLowerCase().includes('medium') || tag.name.toLowerCase().includes('low'));

        if (suggestedCriticalityTag) {
          newSuggestions.push({
            id: 'missing-criticality',
            title: 'Add criticality tags',
            description: `${assetsWithoutCriticality.length} assets missing criticality classification`,
            tagIds: [suggestedCriticalityTag.id],
            confidence: 85,
            reason: 'Best practice: All assets should have criticality levels',
            category: 'missing'
          });
        }
      }

      // Department consistency
      const departmentTags = availableTags.filter(tag => tag.category === 'department');
      const assetsWithDepartments = selectedAssets.filter(asset =>
        asset.tags?.some(tag => tag.category === 'department')
      );

      if (assetsWithDepartments.length > 0 && assetsWithDepartments.length < selectedAssets.length) {
        const mostCommonDept = assetsWithDepartments.reduce((acc, asset) => {
          const deptTag = asset.tags?.find(tag => tag.category === 'department');
          if (deptTag) {
            acc[deptTag.id] = (acc[deptTag.id] || 0) + 1;
          }
          return acc;
        }, {} as Record<number, number>);

        const [mostCommonDeptId, count] = Object.entries(mostCommonDept)
          .sort(([, a], [, b]) => b - a)[0] || [];

        if (mostCommonDeptId && count > 1) {
          const deptTag = availableTags.find(tag => tag.id === parseInt(mostCommonDeptId));
          if (deptTag) {
            newSuggestions.push({
              id: 'consistency-department',
              title: `Standardize on "${deptTag.name}" department`,
              description: `${count} assets already tagged with this department`,
              tagIds: [parseInt(mostCommonDeptId)],
              confidence: (count / selectedAssets.length) * 100,
              reason: 'Consistency: Group assets by common department',
              category: 'consistency'
            });
          }
        }
      }

      // Type-specific suggestions
      if (uniqueTypes.length === 1) {
        const assetType = uniqueTypes[0];
        const typeSpecificSuggestions = getTypeSpecificSuggestions(assetType, availableTags);

        typeSpecificSuggestions.forEach(suggestion => {
          const assetsWithTag = selectedAssets.filter(asset =>
            asset.tags?.some(tag => suggestion.tagIds.includes(tag.id))
          );

          if (assetsWithTag.length < selectedAssets.length) {
            newSuggestions.push({
              ...suggestion,
              confidence: 75,
              description: `Recommended for ${assetType} assets`,
              category: 'best-practice'
            });
          }
        });
      }

      return newSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    };

    setSuggestions(generateSuggestions());
  }, [selectedAssets, availableTags]);

  const getTypeSpecificSuggestions = (assetType: string, tags: Tag[]) => {
    const suggestions: Omit<Suggestion, 'confidence' | 'category'>[] = [];

    switch (assetType) {
      case 'hardware':
        const physicalTag = tags.find(tag => tag.name.toLowerCase().includes('physical'));
        if (physicalTag) {
          suggestions.push({
            id: 'hardware-physical',
            title: 'Tag as physical asset',
            description: 'Hardware assets should be tagged as physical',
            tagIds: [physicalTag.id],
            reason: 'Best practice for hardware asset tracking'
          });
        }
        break;

      case 'software':
        const applicationTag = tags.find(tag => tag.name.toLowerCase().includes('application'));
        if (applicationTag) {
          suggestions.push({
            id: 'software-application',
            title: 'Tag as application',
            description: 'Software assets benefit from application tagging',
            tagIds: [applicationTag.id],
            reason: 'Software asset classification'
          });
        }
        break;

      case 'service':
        const externalTag = tags.find(tag => tag.name.toLowerCase().includes('external'));
        if (externalTag) {
          suggestions.push({
            id: 'service-external',
            title: 'Tag external services',
            description: 'Service assets often external dependencies',
            tagIds: [externalTag.id],
            reason: 'Service dependency tracking'
          });
        }
        break;
    }

    return suggestions;
  };

  const getCategoryIcon = (category: Suggestion['category']) => {
    switch (category) {
      case 'common':
        return <TrendingUp className="h-4 w-4" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'consistency':
        return <Users className="h-4 w-4" />;
      case 'best-practice':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <TagIcon className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: Suggestion['category']) => {
    switch (category) {
      case 'common':
        return 'text-blue-600';
      case 'missing':
        return 'text-orange-600';
      case 'consistency':
        return 'text-green-600';
      case 'best-practice':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (selectedAssets.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Smart Tag Suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered suggestions for tagging {selectedAssets.length} selected assets
        </p>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map(suggestion => {
              const tags = availableTags.filter(tag => suggestion.tagIds.includes(tag.id));

              return (
                <div
                  key={suggestion.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-0.5 ${getCategoryColor(suggestion.category)}`}>
                        {getCategoryIcon(suggestion.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{suggestion.reason}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <Progress value={suggestion.confidence} className="w-16 h-2" />
                          <span className="text-xs font-medium">{suggestion.confidence.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApplySuggestion(suggestion.tagIds, suggestion.title)}
                    >
                      Apply
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tags.map(tag => (
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
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No suggestions available</p>
            <p className="text-xs">Selected assets are already well-tagged</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}