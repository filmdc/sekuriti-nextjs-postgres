# Runbook System Documentation

## Overview

The Runbook System is a comprehensive incident response module for Sekuriti.io that provides standardized procedures for handling security incidents. It enables teams to create, manage, and execute step-by-step response plans during incidents.

## Features

### 1. Template Library
- **System Templates**: Pre-built runbooks for common incident types (ransomware, phishing, data breach)
- **Custom Templates**: Organization-specific runbooks that can be shared across teams
- **Template Cloning**: Quickly create new runbooks from existing templates

### 2. Runbook Builder
- **Phase Organization**: Steps organized by NIST phases (Detection, Containment, Eradication, Recovery, Post-Incident)
- **Drag & Drop**: Reorder steps within and between phases
- **Role Assignment**: Assign responsible roles to each step
- **Time Tracking**: Estimate duration for each step
- **Critical Steps**: Mark critical steps that require special attention

### 3. Version Control
- **Version Management**: Track changes across runbook versions
- **Version Creation**: Create new versions while preserving history
- **Change Tracking**: See what changed between versions

### 4. Execution Mode
- **Checklist Interface**: Step-by-step execution during incidents
- **Progress Tracking**: Real-time progress monitoring
- **Time Tracking**: Track actual vs estimated time
- **Execution Notes**: Document decisions and observations
- **Step Status**: Mark steps as completed, skipped, or in progress

### 5. Integration Points
- **Incident Linking**: Associate runbooks with incident classifications
- **Tag System**: Organize runbooks with tags
- **Role-Based Access**: Control who can create, edit, and execute runbooks

## File Structure

```
app/(dashboard)/runbooks/
├── page.tsx                    # Main runbook library
├── new/
│   └── page.tsx               # Create new runbook wizard
├── [id]/
│   ├── page.tsx              # View runbook details
│   ├── edit/
│   │   └── page.tsx          # Edit existing runbook
│   └── execute/
│       └── page.tsx          # Execute runbook during incident

app/actions/
└── runbooks.ts               # Server actions for CRUD operations

lib/db/
├── schema-ir.ts              # Database schemas
└── seed-runbooks.ts          # System template seeds

components/ui/
└── [various].tsx             # UI components
```

## Database Schema

### runbooks Table
- `id`: Primary key
- `organizationId`: Links to organization (null for system templates)
- `title`: Runbook name
- `description`: Detailed description
- `classification`: Incident type classification
- `isTemplate`: Boolean flag for templates
- `version`: Version number
- `createdBy`: User who created the runbook

### runbookSteps Table
- `id`: Primary key
- `runbookId`: Foreign key to runbooks
- `phase`: NIST phase (detection, containment, etc.)
- `stepNumber`: Order within phase
- `title`: Step title
- `description`: Detailed instructions
- `responsibleRole`: Assigned role
- `estimatedDuration`: Time estimate in minutes
- `isCritical`: Boolean flag for critical steps
- `tools`: Required tools or scripts
- `notes`: Additional notes

## Usage

### Creating a Runbook

1. Navigate to `/runbooks`
2. Click "Create Runbook"
3. Enter runbook details (title, description, classification)
4. Add steps to each phase:
   - Click "Add Step" in the desired phase
   - Fill in step details
   - Mark critical steps
   - Assign responsible roles
5. Save the runbook

### Using Templates

1. Go to the Templates tab in `/runbooks`
2. Find a suitable template
3. Click "Use Template"
4. Modify the template as needed
5. Save as a new runbook

### Executing During an Incident

1. Open the runbook (`/runbooks/[id]`)
2. Click "Execute"
3. Start the execution timer
4. Work through each step:
   - Follow the instructions
   - Add execution notes
   - Mark as complete or skip
5. Track progress in real-time

### Editing Runbooks

1. Open the runbook
2. Click "Edit"
3. Modify steps:
   - Drag to reorder
   - Edit step details
   - Add/remove steps
4. Save changes or create new version

## API Endpoints

### Server Actions

- `getRunbooks(filters)`: Fetch runbooks with optional filters
- `getRunbook(id)`: Get single runbook with steps
- `createRunbook(data)`: Create new runbook
- `updateRunbook(id, data)`: Update existing runbook
- `deleteRunbook(id)`: Delete runbook
- `cloneTemplate(templateId)`: Clone a template
- `createVersion(runbookId, version)`: Create new version
- `createExecution(data)`: Start runbook execution
- `updateExecutionStep(executionId, stepId, data)`: Update execution progress

## System Templates

### Ransomware Response
- 7 steps across all phases
- Focus on isolation and recovery
- Includes threat identification steps

### Phishing Response
- 7 steps for credential compromise
- Email purging procedures
- User communication templates

### Data Breach Response
- 8 steps including legal requirements
- Evidence preservation
- Regulatory compliance (GDPR, CCPA)

## Best Practices

1. **Keep Steps Atomic**: Each step should be a single, clear action
2. **Include Tools**: List specific tools and commands needed
3. **Assign Clear Roles**: Ensure role assignments are unambiguous
4. **Time Estimates**: Be realistic with duration estimates
5. **Critical Steps**: Mark steps that could impact the incident if skipped
6. **Version Control**: Create new versions for significant changes
7. **Test Runbooks**: Regularly test and update procedures
8. **Document Decisions**: Use execution notes during incidents

## Dependencies

### Required Packages (to be installed)
```bash
npm install --legacy-peer-deps \
  @hello-pangea/dnd \           # Drag and drop
  @radix-ui/react-accordion \   # UI components
  @radix-ui/react-progress \
  @radix-ui/react-scroll-area \
  @radix-ui/react-separator \
  @radix-ui/react-switch \
  sonner                        # Toast notifications
```

## Mobile Responsiveness

The system is fully responsive with:
- Collapsible sidebars on mobile
- Touch-friendly controls
- Optimized layouts for small screens
- Swipe gestures for phase navigation

## Security Considerations

- Role-based access control
- Organization data isolation
- Audit trail for all changes
- Secure template sharing
- Input validation and sanitization

## Future Enhancements

1. **Automation Integration**: Connect with security tools APIs
2. **Collaborative Execution**: Multiple users working on same runbook
3. **Analytics Dashboard**: Execution metrics and improvements
4. **AI Suggestions**: ML-based step recommendations
5. **External Integrations**: SOAR platform connectivity
6. **Compliance Mapping**: Map steps to compliance requirements
7. **Mobile App**: Native mobile execution interface