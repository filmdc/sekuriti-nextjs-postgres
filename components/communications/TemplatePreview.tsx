'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Variable {
  key: string;
  label: string;
  example: string;
}

interface TemplatePreviewProps {
  subject?: string;
  content: string;
  variables?: Record<string, Variable[]>;
  showVariables?: boolean;
  className?: string;
}

export function TemplatePreview({
  subject,
  content,
  variables,
  showVariables = true,
  className,
}: TemplatePreviewProps) {
  const [processedContent, setProcessedContent] = useState('');
  const [processedSubject, setProcessedSubject] = useState('');
  const [highlightedVars, setHighlightedVars] = useState<string[]>([]);

  useEffect(() => {
    processTemplateContent();
  }, [content, subject, variables]);

  const processTemplateContent = () => {
    let processedText = content;
    let processedSubj = subject || '';
    const foundVars: string[] = [];

    if (variables) {
      // Replace variables with example values
      Object.entries(variables).forEach(([category, vars]) => {
        vars.forEach((variable) => {
          const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'g');
          const replacement = showVariables
            ? `<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">${variable.example}</mark>`
            : variable.example;

          if (processedText.match(regex)) {
            foundVars.push(variable.key);
            processedText = processedText.replace(regex, replacement);
          }
          if (processedSubj.match(regex)) {
            processedSubj = processedSubj.replace(regex, variable.example);
          }
        });
      });
    }

    // Highlight any remaining unprocessed variables
    const remainingVarRegex = /{{([^}]+)}}/g;
    if (showVariables) {
      processedText = processedText.replace(
        remainingVarRegex,
        '<mark class="bg-red-200 dark:bg-red-900/50 px-1 rounded">[Missing: $1]</mark>'
      );
      processedSubj = processedSubj.replace(
        remainingVarRegex,
        '[Missing: $1]'
      );
    }

    setProcessedContent(processedText);
    setProcessedSubject(processedSubj);
    setHighlightedVars(foundVars);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {showVariables && highlightedVars.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Variables detected:</span>
            <div className="mt-2 flex flex-wrap gap-1">
              {highlightedVars.map((v) => (
                <Badge key={v} variant="outline" className="text-xs">
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          {processedSubject && (
            <>
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Subject</p>
                <p className="font-medium text-lg">{processedSubject}</p>
              </div>
              <Separator className="my-4" />
            </>
          )}

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div
              className="whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: processedContent
                  .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
                  .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
                  .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                  .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
                  .replace(/^- (.+)$/gm, '<li class="ml-6">$1</li>')
                  .replace(/^\d+\. (.+)$/gm, '<li class="ml-6">$1</li>')
                  .replace(/\n/g, '<br />')
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}