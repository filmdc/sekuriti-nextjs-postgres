import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy,
  Edit,
  Eye,
  Star,
  StarOff,
  MoreVertical,
  Play,
  Trash2,
  Download,
  History,
  Mail,
  Users,
  Shield,
  Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  internal: Users,
  customer: Mail,
  regulatory: Shield,
  media: Megaphone,
};

interface TemplateCardProps {
  template: any;
  viewMode: 'grid' | 'list';
  onToggleFavorite?: () => void;
  onClone?: () => void;
  onDelete?: () => void;
}

export function TemplateCard({
  template,
  viewMode,
  onToggleFavorite,
  onClone,
  onDelete,
}: TemplateCardProps) {
  const CategoryIcon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || Mail;

  if (viewMode === 'list') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <CategoryIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    <Link
                      href={`/communications/${template.id}`}
                      className="hover:underline"
                    >
                      {template.title}
                    </Link>
                  </CardTitle>
                  {template.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      System
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1">
                  {template.subject || 'No subject defined'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {template.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/communications/${template.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/communications/${template.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/communications/${template.id}/use`}>
                      <Play className="mr-2 h-4 w-4" />
                      Use Template
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onToggleFavorite}>
                    {template.isFavorite ? (
                      <>
                        <StarOff className="mr-2 h-4 w-4" />
                        Remove from Favorites
                      </>
                    ) : (
                      <>
                        <Star className="mr-2 h-4 w-4" />
                        Add to Favorites
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onClone}>
                    <Copy className="mr-2 h-4 w-4" />
                    Clone
                  </DropdownMenuItem>
                  {!template.isDefault && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="capitalize">{template.category}</span>
            {template.usageCount > 0 && (
              <>
                <span>•</span>
                <span>Used {template.usageCount} times</span>
              </>
            )}
            {template.lastUsed && (
              <>
                <span>•</span>
                <span>
                  Last used {new Date(template.lastUsed).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
          {template.tags && template.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {template.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      {template.isFavorite && (
        <div className="absolute right-2 top-2 z-10">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <CategoryIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate text-base">
              <Link
                href={`/communications/${template.id}`}
                className="hover:underline"
              >
                {template.title}
              </Link>
            </CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {template.category}
              </Badge>
              {template.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  System
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {template.subject || template.content.substring(0, 100) + '...'}
        </p>
        {template.tags && template.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
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
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {template.usageCount > 0 ? (
              <span>Used {template.usageCount} times</span>
            ) : (
              <span>Never used</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClone}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <Link href={`/communications/${template.id}/use`}>
                <Play className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/communications/${template.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/communications/${template.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/communications/${template.id}/use`}>
                    <Play className="mr-2 h-4 w-4" />
                    Use Template
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleFavorite}>
                  {template.isFavorite ? (
                    <>
                      <StarOff className="mr-2 h-4 w-4" />
                      Remove Favorite
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Add to Favorites
                    </>
                  )}
                </DropdownMenuItem>
                {!template.isDefault && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}