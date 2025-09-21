import { db } from './index';
import { communicationTemplates } from './schema-ir';

const defaultTemplates = [
  {
    title: 'Initial Internal Alert',
    category: 'internal',
    subject: 'URGENT: Security Incident Detected - {{incident.title}}',
    content: `Team,

A security incident has been detected and requires immediate attention.

**Incident Details:**
- **Title:** {{incident.title}}
- **Severity:** {{incident.severity}}
- **Status:** {{incident.status}}
- **Detection Time:** {{incident.detectedAt}}
- **Reference:** {{incident.referenceNumber}}

**Description:**
{{incident.description}}

**Immediate Actions Required:**
1. Review the incident details in the IR platform
2. Follow the assigned runbook procedures
3. Document all actions taken
4. Coordinate with relevant team members

Please acknowledge receipt of this alert and begin response procedures immediately.

**Platform Link:** [View Incident]({{organization.website}}/incidents/{{incident.id}})

Stay alert and follow established protocols.

{{user.name}}
{{user.role}}`,
    tags: ['internal', 'alert', 'initial', 'urgent'],
    isDefault: true,
  },
  {
    title: 'Customer Data Breach Notification',
    category: 'customer',
    subject: 'Important Security Update from {{organization.name}}',
    content: `Dear {{customer.name}},

We are writing to inform you about a recent security incident that may have affected your personal information.

**What Happened:**
On {{incident.detectedAt}}, we discovered unauthorized access to some of our systems. As soon as we became aware of this incident, our security team immediately launched an investigation and took steps to secure our systems.

**Information Involved:**
Based on our investigation, the following information may have been accessed:
- Names and email addresses
- Account usernames
- Encrypted passwords (not readable)
- Transaction history from the past 90 days

**What We Are Doing:**
- We have contained the incident and secured the affected systems
- We are working with leading cybersecurity experts to investigate
- We have notified law enforcement and are cooperating fully
- We have implemented additional security measures to prevent future incidents
- All passwords have been reset as a precaution

**What You Should Do:**
1. **Change Your Password:** Although passwords were encrypted, we recommend you log in and create a new password
2. **Enable Two-Factor Authentication:** Add an extra layer of security to your account
3. **Monitor Your Accounts:** Review your recent account activity for any suspicious transactions
4. **Be Alert to Phishing:** Be cautious of emails asking for personal information

**Credit Monitoring:**
As a precaution, we are offering you 12 months of free credit monitoring and identity theft protection services. To enroll, please visit: [enrollment link]

**For More Information:**
We understand you may have questions. Our dedicated support team is available:
- Email: {{organization.contact}}
- Phone: {{organization.phone}} (Available 24/7)
- FAQ: {{organization.website}}/security-update

We sincerely apologize for any inconvenience this may cause and appreciate your patience as we work to resolve this matter.

Sincerely,

{{user.name}}
{{user.role}}
{{organization.name}}`,
    tags: ['customer', 'breach', 'notification', 'data breach'],
    isDefault: true,
  },
  {
    title: 'Regulatory Compliance Notification',
    category: 'regulatory',
    subject: 'Data Breach Notification - {{organization.name}} - {{incident.referenceNumber}}',
    content: `To: [Regulatory Authority]
Date: {{datetime.date}}
Re: Data Breach Notification pursuant to [Applicable Regulation]

**1. NOTIFYING ENTITY**
- Organization: {{organization.name}}
- Address: {{organization.address}}
- Contact: {{organization.contact}}
- Phone: {{organization.phone}}
- Data Protection Officer: {{user.name}}

**2. INCIDENT DETAILS**
- Date of Breach: {{incident.detectedAt}}
- Date of Discovery: {{incident.detectedAt}}
- Reference Number: {{incident.referenceNumber}}
- Classification: {{incident.classification}}
- Severity: {{incident.severity}}

**3. NATURE OF THE BREACH**
{{incident.description}}

**4. CATEGORIES OF DATA AFFECTED**
The following categories of personal data were potentially affected:
- [Specify categories: names, email addresses, etc.]
- [Number of data subjects affected]
- [Geographic scope]

**5. LIKELY CONSEQUENCES**
Based on our assessment, the potential consequences include:
- [Risk assessment details]
- [Potential harm to data subjects]

**6. MEASURES TAKEN**
Immediate measures implemented:
- Incident contained at {{incident.containedAt}}
- Affected systems isolated
- Security patches applied
- Additional monitoring deployed
- Law enforcement notified

**7. PROPOSED MEASURES**
Additional measures to be implemented:
- [Future security enhancements]
- [Process improvements]
- [Training initiatives]

**8. DATA SUBJECT NOTIFICATION**
- Notification sent: {{datetime.current}}
- Method: Email and postal mail
- Number notified: [Number]

**9. DOCUMENTATION**
Supporting documentation is available upon request, including:
- Incident response log
- Technical investigation report
- Risk assessment
- Communication records

This notification is submitted in compliance with [specific regulation citation] within the required 72-hour timeframe.

Submitted by:

{{user.name}}
{{user.role}}
{{organization.name}}

Contact for follow-up:
Email: {{user.email}}
Phone: {{organization.phone}}`,
    tags: ['regulatory', 'compliance', 'gdpr', 'breach notification', 'legal'],
    isDefault: true,
  },
  {
    title: 'Media/Press Statement',
    category: 'media',
    subject: 'Press Statement: {{organization.name}} Addresses Recent Security Incident',
    content: `FOR IMMEDIATE RELEASE

**{{organization.name}} Addresses Recent Security Incident**

{{datetime.date}} - {{organization.name}} today announced that it recently experienced a security incident affecting [brief description]. The company has taken immediate action to investigate and respond to the incident.

"The security and privacy of our customers' information is our top priority," said {{user.name}}, {{user.role}} at {{organization.name}}. "We have taken swift action to address this incident and are working around the clock to support our affected customers."

**Key Facts:**
- The incident was detected on {{incident.detectedAt}}
- Immediate containment measures were implemented
- No [specify what was NOT affected if applicable]
- The incident has been contained and systems are secure

**Customer Support:**
{{organization.name}} has established a dedicated support line for customers with questions:
- Phone: {{organization.phone}}
- Email: {{organization.contact}}
- Website: {{organization.website}}/support

**About {{organization.name}}:**
[Brief company description]

**Media Contact:**
{{user.name}}
{{user.email}}
{{organization.phone}}

###`,
    tags: ['media', 'press', 'public', 'statement'],
    isDefault: true,
  },
  {
    title: 'Incident Resolved - Internal Update',
    category: 'internal',
    subject: 'Incident {{incident.referenceNumber}} - RESOLVED',
    content: `Team,

I'm pleased to inform you that the security incident {{incident.referenceNumber}} has been successfully resolved.

**Resolution Summary:**
- **Incident:** {{incident.title}}
- **Duration:** {{incident.detectedAt}} to {{datetime.current}}
- **Final Status:** {{incident.status}}
- **Root Cause:** [Brief description]

**Actions Taken:**
1. [List key remediation steps]
2. [Security measures implemented]
3. [Process improvements]

**Lessons Learned:**
- [Key takeaways]
- [Areas for improvement]
- [Preventive measures for future]

**Follow-up Actions:**
- Post-incident review scheduled for [date]
- Documentation updates in progress
- Training sessions planned

Thank you to everyone who contributed to the rapid and effective response to this incident. Your professionalism and dedication were instrumental in minimizing impact and achieving resolution.

A detailed post-incident report will be shared once the review is complete.

{{user.name}}
{{user.role}}`,
    tags: ['internal', 'resolution', 'update', 'closed'],
    isDefault: true,
  },
  {
    title: 'Stakeholder Progress Update',
    category: 'internal',
    subject: 'Security Incident Update - {{incident.title}}',
    content: `Dear Stakeholders,

This is a progress update regarding the ongoing security incident.

**Current Status: {{incident.status}}**

**Progress Since Last Update:**
- [Key achievements]
- [Milestones reached]
- [Issues resolved]

**Current Activities:**
- [Ongoing investigations]
- [Remediation efforts]
- [System improvements]

**Challenges:**
- [Any blockers or issues]
- [Resource needs]

**Next Steps:**
- [Planned activities]
- [Expected timeline]
- [Key decisions needed]

**Metrics:**
- Systems affected: [number]
- Systems restored: [number]
- Estimated time to full resolution: [timeframe]

**Support Needed:**
[Any specific requests for stakeholder support]

We continue to treat this matter with the highest priority and will provide another update in [timeframe].

Best regards,

{{user.name}}
{{user.role}}
{{organization.name}}`,
    tags: ['internal', 'stakeholder', 'update', 'progress'],
    isDefault: true,
  },
  {
    title: 'Vendor Security Incident Notification',
    category: 'customer',
    subject: 'Important Security Notice - Action Required',
    content: `Dear Valued Partner,

We are contacting you regarding a security incident that was recently discovered affecting our systems that interface with your organization.

**Incident Overview:**
- Detection Date: {{incident.detectedAt}}
- Systems Affected: [Specify which systems/integrations]
- Current Status: {{incident.status}}

**Impact to Your Organization:**
Based on our investigation, the following data related to your organization may have been accessed:
- [Specific data types]
- [Transaction records from date range]
- [API keys/credentials - now reset]

**Immediate Actions Required:**
1. **Reset API Credentials:** Please generate new API keys for all integrations
2. **Review Access Logs:** Check your system logs for any unusual activity
3. **Update Security Contacts:** Confirm your security contact information

**Our Response:**
- All affected systems have been secured
- Additional security monitoring has been implemented
- Full forensic investigation is underway
- Law enforcement has been notified

**Support Resources:**
Our vendor security team is available to assist:
- Dedicated Hotline: {{organization.phone}}
- Email: vendor-security@{{organization.contact}}
- Secure Portal: [URL for detailed information]

**Next Steps:**
1. Please acknowledge receipt of this notification
2. Complete the attached security questionnaire
3. Schedule a call with our security team if needed

We apologize for any inconvenience and are committed to maintaining the security of our partnership.

Sincerely,

{{user.name}}
{{user.role}}
Vendor Security Team
{{organization.name}}`,
    tags: ['vendor', 'partner', 'b2b', 'notification'],
    isDefault: true,
  },
];

export async function seedTemplates() {
  try {
    console.log('Seeding communication templates...');

    for (const template of defaultTemplates) {
      await db.insert(communicationTemplates).values({
        ...template,
        organizationId: null, // System templates
        createdBy: 1, // System user
      }).onConflictDoNothing();
    }

    console.log(`Successfully seeded ${defaultTemplates.length} communication templates`);
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedTemplates()
    .then(() => {
      console.log('Template seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Template seeding failed:', error);
      process.exit(1);
    });
}