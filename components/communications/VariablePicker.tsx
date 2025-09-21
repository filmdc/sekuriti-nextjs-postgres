import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Building,
  Calendar,
  Copy,
  Plus,
  User
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Variable {
  key: string;
  label: string;
  example: string;
}

interface VariablePickerProps {
  variables: Record<string, Variable[]>;
  onSelectVariable: (variable: string) => void;
  className?: string;
}

const CATEGORY_ICONS = {
  incident: AlertTriangle,
  organization: Building,
  user: User,
  datetime: Calendar,
};

export function VariablePicker({
  variables,
  onSelectVariable,
  className,
}: VariablePickerProps) {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(Object.keys(variables)[0]);

  const handleCopy = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(`{{${variable}}}`);
      setCopiedVar(variable);
      setTimeout(() => setCopiedVar(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleInsert = (variable: string) => {
    onSelectVariable(variable);
  };

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle>Variables</CardTitle>
        <CardDescription>
          Click to insert variables into your template
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 rounded-none">
            {Object.keys(variables).map((category) => {
              const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-xs capitalize"
                >
                  {Icon && <Icon className="mr-1 h-3 w-3" />}
                  {category}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(variables).map(([category, vars]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-4">
                  {vars.map((variable) => (
                    <div
                      key={variable.key}
                      className="group rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                              {`{{${variable.key}}}`}
                            </code>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
                                    onClick={() => handleCopy(variable.key)}
                                  >
                                    {copiedVar === variable.key ? (
                                      <span className="text-xs">✓</span>
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy variable</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-sm">{variable.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Example: {variable.example}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => handleInsert(variable.key)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="border-t p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Custom Variables</h4>
            <p className="text-xs text-muted-foreground">
              You can also create custom variables like {'{{custom.name}}'} and fill them when using the template.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleInsert('custom.variable')}
            >
              <Plus className="mr-2 h-3 w-3" />
              Add Custom Variable
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}