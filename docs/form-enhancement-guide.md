# Form Enhancement Guide

This guide explains how to upgrade existing forms to use the new enhanced form components with improved validation, auto-save functionality, and better user experience.

## New Components Overview

### Enhanced Input Components
- `EnhancedInput` - Input with real-time validation, auto-save, and enhanced UX
- `EnhancedTextarea` - Textarea with auto-resize, character count, and validation
- `EnhancedSelect` - Select with search, validation, and better descriptions
- `FormField` - Wrapper component with consistent labeling and error display

### Validation and Auto-Save Hooks
- `useFormValidation` - Comprehensive form validation with real-time feedback
- `useAutoSave` - Automatic draft saving with configurable strategies

## Migration Process

### Step 1: Replace Basic Inputs

**Before:**
```tsx
<div className="space-y-2">
  <Label htmlFor="title">Title *</Label>
  <Input
    id="title"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    required
  />
  {error && <p className="text-red-500 text-sm">{error}</p>}
</div>
```

**After:**
```tsx
<FormField
  label="Title"
  required
  tooltip="Brief, descriptive title that clearly identifies the incident"
  error={formValidation.getFieldProps('title').error}
>
  <EnhancedInput
    placeholder="e.g., Suspicious login attempts from unknown IPs"
    autoFocus
    showValidation
    {...formValidation.getFieldProps('title')}
    onChange={(e) => formValidation.handleChange('title', e.target.value)}
  />
</FormField>
```

### Step 2: Add Form Validation

**Before:**
```tsx
const [formData, setFormData] = useState({
  title: '',
  description: '',
  severity: 'medium'
});

const [errors, setErrors] = useState({});
```

**After:**
```tsx
import { useFormValidation } from '@/hooks/use-form-validation';

const formValidation = useFormValidation(
  initialValues,
  validationRules,
  { validateOnChange: true, debounceMs: 300 }
);
```

### Step 3: Add Auto-Save

```tsx
import { useAutoSave } from '@/hooks/use-auto-save';

const autoSave = useAutoSave(formValidation.values, {
  delay: 3000,
  enabled: true,
  onSave: async (data) => {
    await saveDraft(data);
  },
  onError: (error) => {
    console.error('Auto-save failed:', error);
  },
});
```

### Step 4: Enhanced Textarea

**Before:**
```tsx
<textarea
  className="min-h-[100px] w-full rounded-md border"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

**After:**
```tsx
<EnhancedTextarea
  placeholder="Detailed description..."
  autoResize
  minRows={4}
  maxRows={8}
  showCharacterCount
  minCharacters={20}
  maxCharacters={2000}
  autoSave
  onAutoSave={async (content) => {
    formValidation.handleChange('description', content);
  }}
  {...formValidation.getFieldProps('description')}
  onChange={(e) => formValidation.handleChange('description', e.target.value)}
/>
```

### Step 5: Enhanced Select

**Before:**
```tsx
<select
  value={severity}
  onChange={(e) => setSeverity(e.target.value)}
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
</select>
```

**After:**
```tsx
<EnhancedSelect
  placeholder="Select severity"
  searchable
  value={formValidation.values.severity}
  onValueChange={(value) => formValidation.handleChange('severity', value)}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="low" description="Minimal impact">Low</SelectItem>
    <SelectItem value="medium" description="Moderate impact">Medium</SelectItem>
  </SelectContent>
</EnhancedSelect>
```

## Validation Rules

Define validation rules for your form fields:

```tsx
const validationRules = {
  title: {
    required: true,
    min: 5,
    max: 200
  },
  description: {
    required: true,
    min: 20,
    max: 2000
  },
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    strongPassword: true
  },
  classification: {
    required: true
  },
};
```

## Auto-Save Configuration

Configure auto-save behavior based on form importance:

```tsx
// Critical forms (incidents) - aggressive auto-save
const autoSaveConfig = {
  delay: 2000,
  enabled: true,
  saveOnUnmount: true,
  ignoreFields: ['confirmPassword'],
};

// Long forms (runbooks) - conservative auto-save
const autoSaveConfig = {
  delay: 5000,
  enabled: true,
  saveOnUnmount: true,
};

// Settings forms - manual save only
const autoSaveConfig = {
  enabled: false,
};
```

## Form Submission

Enhanced form submission with better error handling:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formValidation.validateAllFields()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const result = await onSubmit(formValidation.values);

    if ('error' in result) {
      // Handle server-side validation errors
      formValidation.setError('title', result.error);
    } else {
      // Success - redirect or show success message
      router.push(`/items/${result.id}`);
    }
  } catch (error) {
    console.error('Failed to submit:', error);
    formValidation.setError('title', 'Submission failed. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

## Field-Specific Enhancements

### Email Fields
```tsx
<EnhancedInput
  type="email"
  placeholder="user@company.com"
  formatExample="user@domain.com"
  showValidation
  onValidate={validateEmailAsync}
  {...formValidation.getFieldProps('email')}
/>
```

### Password Fields
```tsx
<EnhancedInput
  type="password"
  showPasswordToggle
  placeholder="Enter secure password"
  showValidation
  onValidate={validatePasswordStrength}
  {...formValidation.getFieldProps('password')}
/>
```

### Long Text Fields
```tsx
<EnhancedTextarea
  placeholder="Detailed explanation..."
  autoResize
  minRows={3}
  maxRows={10}
  showCharacterCount
  maxCharacters={1000}
  autoSave
  validationDelay={500}
  {...formValidation.getFieldProps('content')}
/>
```

## Best Practices

### 1. Progressive Enhancement
Start with basic forms and add enhanced features incrementally:
- First: Replace basic inputs with enhanced versions
- Second: Add validation rules
- Third: Enable auto-save
- Fourth: Add advanced features (real-time validation, tooltips)

### 2. Form-Specific Configuration
Use different configurations for different form types:

```tsx
import { getFormConfig } from '@/lib/form-config';

const config = getFormConfig('incident'); // Gets incident-specific config
```

### 3. Error Handling
Provide clear, actionable error messages:

```tsx
const validateTitle = async (title: string) => {
  if (!title) return 'Title is required';
  if (title.length < 5) return 'Title must be at least 5 characters';
  if (await titleExists(title)) return 'This title is already in use';
  return null;
};
```

### 4. Loading States
Show appropriate loading states for different operations:

```tsx
{autoSave.isSaving && (
  <div className="flex items-center gap-1 text-sm text-muted-foreground">
    <Clock className="h-3 w-3 animate-pulse" />
    Saving draft...
  </div>
)}
```

### 5. Mobile Optimization
The enhanced components are mobile-optimized by default:
- Larger touch targets (44px minimum)
- Prevented zoom on iOS for certain input types
- Enhanced focus states for better accessibility

## Migration Checklist

- [ ] Replace basic Input components with EnhancedInput
- [ ] Replace textarea elements with EnhancedTextarea
- [ ] Replace select elements with EnhancedSelect
- [ ] Wrap fields in FormField components
- [ ] Add useFormValidation hook
- [ ] Define validation rules
- [ ] Add useAutoSave hook (if needed)
- [ ] Update form submission handling
- [ ] Add loading states and error feedback
- [ ] Test on mobile devices
- [ ] Add tooltips and help text
- [ ] Configure auto-save strategy
- [ ] Test validation edge cases

## Example: Complete Migration

See `/app/(dashboard)/incidents/new/enhanced-page.tsx` for a complete example of migrating the incident form to use enhanced components.