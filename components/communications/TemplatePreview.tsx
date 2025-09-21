'use client';

import { useEffect, useState } from 'react';
import { extractVariables, replaceVariables, getDefaultVariableValues, formatVariableForDisplay } from '@/lib/template-variables';
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
    // Extract all variables from content and subject
    const foundVars = extractVariables(content, subject);
    setHighlightedVars(foundVars);

    // Build variable data map from available variables
    const variableDataMap: Record<string, string> = {};
    if (variables) {
      Object.entries(variables).forEach(([category, vars]) => {
        vars.forEach((variable) => {
          variableDataMap[variable.key] = variable.example;
        });
      });
    }

    // Process content
    let processedText = content;
    let processedSubj = subject || '';

    foundVars.forEach(variable => {
      const regex = new RegExp(`\\{\\{\\s*${escapeRegex(variable)}\\s*\\}\\}`, 'g');
      const exampleValue = variableDataMap[variable];

      if (exampleValue) {
        const safeExampleValue = escapeHtml(exampleValue);
        const replacement = showVariables
          ? `<span class="bg-yellow-100 dark:bg-yellow-900/30 px-1 py-0.5 rounded text-yellow-800 dark:text-yellow-200 font-medium border border-yellow-200 dark:border-yellow-800">${safeExampleValue}</span>`
          : safeExampleValue;

        processedText = processedText.replace(regex, replacement);
        processedSubj = processedSubj.replace(regex, safeExampleValue);
      } else {
        // Variable not found in available variables
        const missingText = `[Missing: ${variable}]`;
        if (showVariables) {
          const missingReplacement = `<span class="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-red-800 dark:text-red-200 font-medium border border-red-200 dark:border-red-800">${missingText}</span>`;
          processedText = processedText.replace(regex, missingReplacement);
          processedSubj = processedSubj.replace(regex, missingText);
        } else {
          processedText = processedText.replace(regex, missingText);
          processedSubj = processedSubj.replace(regex, missingText);
        }
      }
    });

    setProcessedContent(processedText);
    setProcessedSubject(processedSubj);
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const processMarkdown = (text: string): string => {
    return text
      // Process markdown formatting with better regex
      .replace(/\*\*([^*]+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`([^`\n]+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Process headings (must be at start of line)
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 mt-6 first:mt-0">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 mt-5 first:mt-0">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 mt-4 first:mt-0">$1</h3>')
      // Process lists with proper HTML structure
      .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-muted-foreground mt-1.5 text-xs w-2 flex-shrink-0">•</span><span class="flex-1">$1</span></div>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-muted-foreground mt-1.5 text-xs font-medium min-w-[1.5rem] flex-shrink-0">$1.</span><span class="flex-1">$2</span></div>')
      // Process quotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-muted pl-4 py-2 my-3 italic text-muted-foreground bg-muted/30 rounded-r">$1</blockquote>')
      // Process horizontal rules
      .replace(/^---$/gm, '<hr class="my-6 border-border" />')
      // Convert line breaks
      .replace(/\n/g, '<br />');
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
                __html: processMarkdown(processedContent)
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}