import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  templateCounts?: Record<string, number>;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  templateCounts = {},
}: CategoryFilterProps) {
  return (
    <Card className="h-fit w-64">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Categories</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = templateCounts[category.id] || 0;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isSelected && 'bg-accent text-accent-foreground font-medium'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}