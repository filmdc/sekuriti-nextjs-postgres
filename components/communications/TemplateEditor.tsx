'use client';

import { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Minus,
  Variable
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TemplateEditorProps {
  content: string;
  onChange: (content: string) => void;
  onInsertVariable?: (variable: string) => void;
  className?: string;
}

export function TemplateEditor({
  content,
  onChange,
  onInsertVariable,
  className,
}: TemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    onChange(newContent);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatActions = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertMarkdown('**', '**', 'bold text'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertMarkdown('*', '*', 'italic text'),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertMarkdown('[', '](url)', 'link text'),
    },
    {
      icon: Code,
      label: 'Code',
      action: () => insertMarkdown('`', '`', 'code'),
    },
    { type: 'separator' },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertMarkdown('# ', '', 'Heading'),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertMarkdown('## ', '', 'Heading'),
    },
    { type: 'separator' },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertMarkdown('- ', '', 'List item'),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertMarkdown('1. ', '', 'List item'),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertMarkdown('> ', '', 'Quote'),
    },
    {
      icon: Minus,
      label: 'Horizontal Rule',
      action: () => insertMarkdown('\n---\n', '', ''),
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      insertMarkdown('  ', '', '');
    }

    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**', 'bold text');
    }

    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*', 'italic text');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="template-content">Content *</Label>
        <TooltipProvider>
          <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
            {formatActions.map((action, index) => {
              if (action.type === 'separator') {
                return (
                  <div
                    key={index}
                    className="mx-1 h-6 w-px bg-border"
                  />
                );
              }

              const Icon = action.icon!;
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={action.action}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {onInsertVariable && (
              <>
                <div className="mx-1 h-6 w-px bg-border" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        // This would typically open a variable picker modal
                        // For now, we'll insert a placeholder
                        insertMarkdown('{{', '}}', 'variable.name');
                      }}
                    >
                      <Variable className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Insert Variable</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
      </div>
      <Textarea
        ref={textareaRef}
        id="template-content"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your template content here...

Use markdown for formatting:
**bold**, *italic*, [links](url)

Insert variables with {{variable.name}} syntax"
        className="min-h-[400px] font-mono text-sm"
      />
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>Markdown supported</span>
        <span>•</span>
        <span>Variables: {'{{variable.name}}'}</span>
        <span>•</span>
        <span>Ctrl+B for bold, Ctrl+I for italic</span>
      </div>
    </div>
  );
}