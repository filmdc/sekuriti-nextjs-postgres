# Communication Templates Module

## Overview

The Communication Templates module provides a comprehensive system for managing and using pre-defined communication templates during incident response. It enables teams to quickly send consistent, professional communications to various stakeholders during security incidents.

## Features

### Core Functionality

1. **Template Management**
   - Create, edit, and delete communication templates
   - Organize templates by categories (Internal, Customer, Regulatory, Media)
   - Tag system for better organization and searchability
   - Version history tracking for template changes

2. **Dynamic Variables**
   - Support for template variables using `{{variable.name}}` syntax
   - Auto-population from incident data
   - Variable categories: incident, organization, user, datetime, asset
   - Custom variable support

3. **Rich Text Editing**
   - Markdown support for formatting
   - Live preview with variable replacement
   - Toolbar for quick formatting options
   - Keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic)

4. **Quick Use During Incidents**
   - One-click template usage from incident pages
   - Auto-fill incident context
   - Multiple delivery methods (Email, SMS, Manual)
   - Export options (PDF-ready, Email-ready, Clipboard)

5. **Template Library**
   - System default templates
   - Organization-specific templates
   - Favorites system for quick access
   - Usage statistics and tracking
   - Template cloning

## File Structure

```
app/(dashboard)/communications/
├── page.tsx                    # Main template library page
├── new/page.tsx               # Create new template
├── [id]/
│   ├── page.tsx              # View template details
│   ├── edit/page.tsx         # Edit existing template
│   └── use/page.tsx          # Use template (send communication)

components/communications/
├── CategoryFilter.tsx         # Sidebar category filter
├── TemplateCard.tsx          # Template display card
├── TemplateEditor.tsx        # Rich text editor with markdown
├── VariablePicker.tsx        # Variable insertion helper
├── TemplatePreview.tsx       # Live preview component
└── TemplateVersionHistory.tsx # Version history display

app/api/communications/
├── templates/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts          # GET, PUT, DELETE
│       └── clone/route.ts    # POST (clone template)
├── send/route.ts             # Send communication
└── variables/route.ts        # Variable processing
```

## Database Schema

The module uses the following database tables:

### communicationTemplates
```typescript
{
  id: serial
  organizationId: integer (null for system templates)
  title: varchar(255)
  category: varchar(100)
  subject: varchar(255)
  content: text
  tags: jsonb
  isDefault: boolean
  createdBy: integer
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Template Categories

- **Internal**: Team alerts, stakeholder updates, progress reports
- **Customer**: Breach notifications, service updates, incident notices
- **Regulatory**: Compliance notifications, legal requirements
- **Media**: Press releases, public statements

## Available Variables

### Incident Variables
- `{{incident.title}}` - Incident title
- `{{incident.severity}}` - Severity level
- `{{incident.status}}` - Current status
- `{{incident.detectedAt}}` - Detection timestamp
- `{{incident.description}}` - Incident description
- `{{incident.referenceNumber}}` - Reference number

### Organization Variables
- `{{organization.name}}` - Organization name
- `{{organization.contact}}` - Contact email
- `{{organization.phone}}` - Contact phone
- `{{organization.website}}` - Website URL

### User Variables
- `{{user.name}}` - Current user name
- `{{user.email}}` - User email
- `{{user.role}}` - User role

### DateTime Variables
- `{{datetime.current}}` - Current date/time
- `{{datetime.date}}` - Current date
- `{{datetime.time}}` - Current time

## Usage Examples

### Creating a Template

1. Navigate to `/communications/new`
2. Fill in template details:
   - Name, category, tags
   - Email subject (optional)
   - Template content with markdown and variables
3. Use the variable picker to insert dynamic content
4. Preview the template with sample data
5. Save the template

### Using a Template During an Incident

1. From an incident page, click "Send Communication"
2. Select a template from the library
3. System auto-fills incident variables
4. Fill in any missing variables
5. Choose delivery method (Email, SMS, Manual)
6. Add recipients
7. Review and send

### Quick Actions

- **Clone Template**: Create a copy for customization
- **Add to Favorites**: Star templates for quick access
- **Export**: Download template as text file
- **Version History**: Track and restore previous versions

## API Endpoints

### List Templates
```http
GET /api/communications/templates
?category=customer
&search=breach
&includeSystem=true
```

### Create Template
```http
POST /api/communications/templates
{
  "title": "Customer Notification",
  "category": "customer",
  "subject": "Important Update",
  "content": "Template content...",
  "tags": ["urgent", "breach"]
}
```

### Send Communication
```http
POST /api/communications/send
{
  "templateId": 1,
  "incidentId": 5,
  "method": "email",
  "recipients": ["user@example.com"],
  "subject": "Processed subject",
  "content": "Processed content"
}
```

## Default Templates

The system includes 7 pre-configured templates:

1. **Initial Internal Alert** - Urgent team notifications
2. **Customer Data Breach Notification** - GDPR-compliant breach notice
3. **Regulatory Compliance Notification** - Legal/regulatory reporting
4. **Media/Press Statement** - Public communications
5. **Incident Resolved - Internal Update** - Closure notifications
6. **Stakeholder Progress Update** - Status reports
7. **Vendor Security Incident Notification** - B2B communications

## Security Considerations

- Templates are organization-scoped (except system templates)
- Only organization admins can create/edit templates
- Audit logging for all communications sent
- Variable values are sanitized before insertion
- Email/SMS integration requires proper authentication

## Future Enhancements

- [ ] Multi-language template support
- [ ] Template approval workflows
- [ ] Scheduled communications
- [ ] Communication analytics dashboard
- [ ] Integration with external communication platforms
- [ ] Template performance metrics
- [ ] A/B testing for templates
- [ ] Attachment support
- [ ] Rich HTML email templates
- [ ] Template sharing between organizations

## Seeding Templates

To seed the default templates:

```bash
npm run db:seed-templates
# or
npx tsx lib/db/seed-templates.ts
```

## Mobile Responsiveness

All components are fully responsive:
- Template cards adapt to screen size
- Editor toolbar stacks on mobile
- Variable picker becomes bottom sheet on mobile
- Preview adjusts to viewport width

## Performance Optimizations

- Templates cached on client side
- Lazy loading of template content
- Debounced search
- Virtual scrolling for large template lists
- Optimistic UI updates

## Testing

The module includes:
- Unit tests for variable processing
- Integration tests for API endpoints
- E2E tests for critical workflows
- Accessibility testing (WCAG compliance)