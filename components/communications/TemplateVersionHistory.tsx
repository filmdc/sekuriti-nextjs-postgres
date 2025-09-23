'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  History,
  Eye,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  User
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Version {
  id: number;
  version: string;
  changedBy: string;
  changedAt: Date;
  changes: string;
}

interface TemplateVersionHistoryProps {
  versions: Version[];
  onRestore?: (versionId: number) => void;
  onViewDiff?: (versionId: number) => void;
  className?: string;
}

export function TemplateVersionHistory({
  versions,
  onRestore,
  onViewDiff,
  className,
}: TemplateVersionHistoryProps) {
  const [expandedVersions, setExpandedVersions] = useState<number[]>([]);

  const toggleExpanded = (versionId: number) => {
    setExpandedVersions(prev =>
      prev.includes(versionId)
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes === 0 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  if (versions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No version history</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Changes to this template will be tracked here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Version History</CardTitle>
        <CardDescription>
          Track changes and restore previous versions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.map((version, index) => {
          const isExpanded = expandedVersions.includes(version.id);
          const isLatest = index === 0;

          return (
            <Collapsible
              key={version.id}
              open={isExpanded}
              onOpenChange={() => toggleExpanded(version.id)}
            >
              <div
                className={cn(
                  'rounded-lg border p-4',
                  isLatest && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/avatars/${version.changedBy}.png`} />
                      <AvatarFallback className="text-xs">
                        {getInitials(version.changedBy)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Version {version.version}</p>
                        {isLatest && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {version.changedBy} • {formatDate(version.changedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isLatest && onRestore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRestore(version.id)}
                      >
                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                        Restore
                      </Button>
                    )}
                    {onViewDiff && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDiff(version.id)}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        View
                      </Button>
                    )}
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm font-medium mb-1">Changes</p>
                      <p className="text-sm text-muted-foreground">
                        {version.changes}
                      </p>
                    </div>
                    {index < versions.length - 1 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span>
                          Previous: Version {versions[index + 1].version} by{' '}
                          {versions[index + 1].changedBy}
                        </span>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <History className="h-4 w-4" />
            <span>Showing {versions.length} versions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}