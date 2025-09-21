import { db } from './index';
import { runbooks, runbookSteps } from './schema-ir';

export async function seedSystemRunbookTemplates() {
  console.log('Seeding system runbook templates...');

  // Ransomware Response Template
  const ransomwareTemplate = await db
    .insert(runbooks)
    .values({
      organizationId: null, // System template
      title: 'Ransomware Incident Response',
      description: 'Complete response procedure for ransomware attacks',
      classification: 'ransomware',
      isTemplate: true,
      isActive: true,
      version: '1.0',
      createdBy: 1, // System user
    })
    .returning();

  const ransomwareSteps = [
    // Detection Phase
    {
      runbookId: ransomwareTemplate[0].id,
      phase: 'detection',
      stepNumber: 1,
      title: 'Initial Alert Verification',
      description: 'Verify the ransomware alert through security tools and logs. Check antivirus alerts, EDR notifications, and user reports.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 15,
      isCritical: true,
      tools: 'EDR console, SIEM dashboard, Antivirus logs',
    },
    {
      runbookId: ransomwareTemplate[0].id,
      phase: 'detection',
      stepNumber: 2,
      title: 'Identify Ransomware Variant',
      description: 'Determine the specific ransomware variant using file extensions, ransom notes, and threat intelligence sources.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 30,
      isCritical: true,
      tools: 'ID Ransomware tool, VirusTotal, threat intelligence feeds',
    },
    // Containment Phase
    {
      runbookId: ransomwareTemplate[0].id,
      phase: 'containment',
      stepNumber: 1,
      title: 'Isolate Affected Systems',
      description: 'Immediately disconnect infected systems from the network. Disable WiFi, unplug ethernet cables, and block at firewall if remote.',
      responsibleRole: 'IT Administrator',
      estimatedDuration: 10,
      isCritical: true,
      notes: 'Do NOT power off systems as this may trigger additional encryption',
    },
    {
      runbookId: ransomwareTemplate[0].id,
      phase: 'containment',
      stepNumber: 2,
      title: 'Identify Patient Zero',
      description: 'Trace back to the initial infection vector and compromised account or system.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 60,
      isCritical: false,
      tools: 'SIEM queries, email logs, web proxy logs',
    },
    // Eradication Phase
    {
      runbookId: ransomwareTemplate[0].id,
      phase: 'eradication',
      stepNumber: 1,
      title: 'Remove Ransomware',
      description: 'Use appropriate tools to remove ransomware from infected systems. Consider reimaging if removal is not possible.',
      responsibleRole: 'IT Administrator',
      estimatedDuration: 120,
      isCritical: true,
      tools: 'Antivirus removal tools, system restore, backup systems',
    },
    // Recovery Phase
    {
      runbookId: ransomwareTemplate[0].id,
      phase: 'recovery',
      stepNumber: 1,
      title: 'Restore from Backups',
      description: 'Restore data from clean backups after verifying they are not infected.',
      responsibleRole: 'IT Administrator',
      estimatedDuration: 240,
      isCritical: true,
      notes: 'Verify backup integrity before restoration',
    },
    // Post-Incident Phase
    {
      runbookId: ransomwareTemplate[0].id,
      phase: 'post_incident',
      stepNumber: 1,
      title: 'Conduct Lessons Learned',
      description: 'Hold a post-incident review meeting to identify improvements and update procedures.',
      responsibleRole: 'Incident Commander',
      estimatedDuration: 60,
      isCritical: false,
    },
  ];

  await db.insert(runbookSteps).values(ransomwareSteps);

  // Phishing Response Template
  const phishingTemplate = await db
    .insert(runbooks)
    .values({
      organizationId: null,
      title: 'Phishing Attack Response',
      description: 'Response procedure for phishing emails and compromised credentials',
      classification: 'phishing',
      isTemplate: true,
      isActive: true,
      version: '1.0',
      createdBy: 1,
    })
    .returning();

  const phishingSteps = [
    // Detection Phase
    {
      runbookId: phishingTemplate[0].id,
      phase: 'detection',
      stepNumber: 1,
      title: 'Verify Phishing Report',
      description: 'Analyze the reported email for phishing indicators. Check sender, links, and attachments.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 10,
      isCritical: false,
      tools: 'Email headers, URL sandbox, VirusTotal',
    },
    // Containment Phase
    {
      runbookId: phishingTemplate[0].id,
      phase: 'containment',
      stepNumber: 1,
      title: 'Block Sender and URLs',
      description: 'Add sender to block list and block malicious URLs at proxy/firewall.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 15,
      isCritical: true,
      tools: 'Email security gateway, web proxy, firewall',
    },
    {
      runbookId: phishingTemplate[0].id,
      phase: 'containment',
      stepNumber: 2,
      title: 'Identify Affected Users',
      description: 'Search email logs to identify all users who received the phishing email.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 30,
      isCritical: true,
      tools: 'Email server logs, SIEM',
    },
    // Eradication Phase
    {
      runbookId: phishingTemplate[0].id,
      phase: 'eradication',
      stepNumber: 1,
      title: 'Remove Phishing Emails',
      description: 'Purge phishing emails from all user mailboxes.',
      responsibleRole: 'IT Administrator',
      estimatedDuration: 30,
      isCritical: true,
      tools: 'Exchange Management Shell, Office 365 Security & Compliance',
    },
    {
      runbookId: phishingTemplate[0].id,
      phase: 'eradication',
      stepNumber: 2,
      title: 'Reset Compromised Credentials',
      description: 'Force password reset for any users who entered credentials.',
      responsibleRole: 'IT Administrator',
      estimatedDuration: 20,
      isCritical: true,
      tools: 'Active Directory, Identity Management System',
    },
    // Recovery Phase
    {
      runbookId: phishingTemplate[0].id,
      phase: 'recovery',
      stepNumber: 1,
      title: 'User Communication',
      description: 'Send communication to affected users about the incident and required actions.',
      responsibleRole: 'Communications Lead',
      estimatedDuration: 30,
      isCritical: false,
      notes: 'Use pre-approved templates',
    },
    // Post-Incident Phase
    {
      runbookId: phishingTemplate[0].id,
      phase: 'post_incident',
      stepNumber: 1,
      title: 'Update Email Filters',
      description: 'Update email security rules based on lessons learned.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 30,
      isCritical: false,
    },
  ];

  await db.insert(runbookSteps).values(phishingSteps);

  // Data Breach Response Template
  const dataBreachTemplate = await db
    .insert(runbooks)
    .values({
      organizationId: null,
      title: 'Data Breach Response',
      description: 'Complete response procedure for data breach incidents',
      classification: 'data_breach',
      isTemplate: true,
      isActive: true,
      version: '1.0',
      createdBy: 1,
    })
    .returning();

  const dataBreachSteps = [
    // Detection Phase
    {
      runbookId: dataBreachTemplate[0].id,
      phase: 'detection',
      stepNumber: 1,
      title: 'Confirm Data Breach',
      description: 'Verify that unauthorized access or exfiltration has occurred. Review logs and alerts.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 45,
      isCritical: true,
      tools: 'DLP alerts, SIEM, database logs',
    },
    {
      runbookId: dataBreachTemplate[0].id,
      phase: 'detection',
      stepNumber: 2,
      title: 'Identify Scope',
      description: 'Determine what data was accessed, volume of records, and data sensitivity.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 120,
      isCritical: true,
      notes: 'Document all findings for legal requirements',
    },
    // Containment Phase
    {
      runbookId: dataBreachTemplate[0].id,
      phase: 'containment',
      stepNumber: 1,
      title: 'Stop Active Breach',
      description: 'Terminate active sessions, block IP addresses, and disable compromised accounts.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 20,
      isCritical: true,
    },
    {
      runbookId: dataBreachTemplate[0].id,
      phase: 'containment',
      stepNumber: 2,
      title: 'Preserve Evidence',
      description: 'Create forensic copies of affected systems and preserve all logs.',
      responsibleRole: 'Security Analyst',
      estimatedDuration: 180,
      isCritical: true,
      tools: 'Forensic imaging tools, chain of custody forms',
    },
    // Eradication Phase
    {
      runbookId: dataBreachTemplate[0].id,
      phase: 'eradication',
      stepNumber: 1,
      title: 'Close Attack Vector',
      description: 'Patch vulnerabilities, update configurations, or fix the security gap that allowed the breach.',
      responsibleRole: 'IT Administrator',
      estimatedDuration: 240,
      isCritical: true,
    },
    // Recovery Phase
    {
      runbookId: dataBreachTemplate[0].id,
      phase: 'recovery',
      stepNumber: 1,
      title: 'Legal Notification',
      description: 'Notify legal counsel and determine regulatory notification requirements.',
      responsibleRole: 'Legal Counsel',
      estimatedDuration: 60,
      isCritical: true,
      notes: 'Check GDPR, CCPA, and other applicable regulations',
    },
    {
      runbookId: dataBreachTemplate[0].id,
      phase: 'recovery',
      stepNumber: 2,
      title: 'Customer Notification',
      description: 'Prepare and send breach notifications to affected individuals as required by law.',
      responsibleRole: 'Communications Lead',
      estimatedDuration: 240,
      isCritical: true,
    },
    // Post-Incident Phase
    {
      runbookId: dataBreachTemplate[0].id,
      phase: 'post_incident',
      stepNumber: 1,
      title: 'Regulatory Reporting',
      description: 'Submit required reports to regulatory bodies within mandated timeframes.',
      responsibleRole: 'Legal Counsel',
      estimatedDuration: 480,
      isCritical: true,
      notes: 'GDPR requires notification within 72 hours',
    },
  ];

  await db.insert(runbookSteps).values(dataBreachSteps);

  console.log('System runbook templates created successfully');
}