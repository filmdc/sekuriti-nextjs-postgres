'use client';

import { useRef, useEffect, useState } from 'react';
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
import { VariableAutocomplete } from './VariableAutocomplete';

interface Variable {
  key: string;
  label: string;
  example: string;
}

interface TemplateEditorProps {
  content: string;
  onChange: (content: string) => void;
  onInsertVariable?: (variable: string) => void;
  variables?: Record<string, Variable[]>;
  className?: string;
}

export function TemplateEditor({
  content,
  onChange,
  onInsertVariable,
  variables,
  className,
}: TemplateEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [autocompleteQuery, setAutocompleteQuery] = useState('');

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
    // Handle autocomplete trigger
    if (e.key === '{' && !showAutocomplete && variables) {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const textBefore = content.substring(0, cursorPos);

        // Check if this is the second '{' (starting a variable)
        if (textBefore.endsWith('{')) {
          // Calculate position for autocomplete dropdown more accurately
          const rect = textarea.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(textarea);
          const lineHeight = parseFloat(computedStyle.lineHeight) || 20;

          // Get text area metrics
          const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
          const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;

          // Calculate cursor position
          const textBeforeCursor = content.substring(0, cursorPos + 1); // +1 for the character being typed
          const lines = textBeforeCursor.split('\n');
          const currentLineIndex = lines.length - 1;
          const currentLineText = lines[currentLineIndex];

          // Create a temporary span to measure text width
          const tempSpan = document.createElement('span');
          tempSpan.style.font = computedStyle.font;
          tempSpan.style.visibility = 'hidden';
          tempSpan.style.position = 'absolute';
          tempSpan.textContent = currentLineText;
          document.body.appendChild(tempSpan);
          const textWidth = tempSpan.offsetWidth;
          document.body.removeChild(tempSpan);

          setAutocompletePosition({
            top: rect.top + paddingTop + (currentLineIndex * lineHeight) + lineHeight + 5,
            left: Math.min(rect.left + paddingLeft + textWidth, window.innerWidth - 320) // Ensure it doesn't go off screen
          });
          setAutocompleteQuery('');
          setShowAutocomplete(true);
        }
      }
    }

    // Handle autocomplete closing
    if (showAutocomplete) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAutocomplete(false);
      } else if (e.key === '}') {
        // Check if we're completing a variable
        const textarea = textareaRef.current;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const textBefore = content.substring(0, cursorPos);
          const lastOpenBrace = textBefore.lastIndexOf('{{');

          if (lastOpenBrace !== -1) {
            const currentVar = textBefore.substring(lastOpenBrace + 2);
            // If we have a valid variable pattern, close autocomplete
            if (currentVar && !currentVar.includes('}')) {
              setTimeout(() => setShowAutocomplete(false), 100);
            }
          }
        }
      } else if (e.key === ' ') {
        // Close on space (variables shouldn't have spaces)
        setShowAutocomplete(false);
      }
    }

    // Update autocomplete query while typing
    if (showAutocomplete && e.key.length === 1 && e.key !== '{' && e.key !== '}') {
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const textBefore = content.substring(0, cursorPos); // Current content without the new character
          const lastOpenBrace = textBefore.lastIndexOf('{{');

          if (lastOpenBrace !== -1) {
            const query = textBefore.substring(lastOpenBrace + 2) + e.key;
            setAutocompleteQuery(query);
          }
        }
      }, 0);
    }

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

  const handleAutocompleteSelect = (variableKey: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = content.substring(0, cursorPos);
      const textAfter = content.substring(cursorPos);

      // Find the start of the current variable being typed
      const lastOpenBrace = textBefore.lastIndexOf('{{');

      if (lastOpenBrace !== -1) {
        const beforeVariable = content.substring(0, lastOpenBrace);
        const newContent = beforeVariable + `{{${variableKey}}}` + textAfter;
        onChange(newContent);

        // Set cursor position after the inserted variable
        setTimeout(() => {
          const newCursorPos = lastOpenBrace + variableKey.length + 4;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }, 0);
      }
    }

    setShowAutocomplete(false);
  };

  const handleAutocompleteClose = () => {
    setShowAutocomplete(false);
  };

  return (
    <div className={cn('space-y-2 relative', className)}>
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
                        // Trigger variable picker if callback is provided
                        if (onInsertVariable) {
                          // Focus the textarea to show cursor position
                          textareaRef.current?.focus();
                          // The parent component will handle opening the variable picker
                          // and call onInsertVariable when a variable is selected
                        } else {
                          insertMarkdown('{{', '}}', 'variable.name');
                        }
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
        <span>Type {'{{'} to insert variables</span>
        <span>•</span>
        <span>Ctrl+B for bold, Ctrl+I for italic</span>
      </div>

      {variables && (
        <VariableAutocomplete
          variables={variables}
          isOpen={showAutocomplete}
          onSelect={handleAutocompleteSelect}
          onClose={handleAutocompleteClose}
          searchQuery={autocompleteQuery}
          position={autocompletePosition}
        />
      )}
    </div>
  );
}