export interface Variable {
  key: string;
  label: string;
  example: string;
}

export interface VariableData {
  incident?: Record<string, any>;
  organization?: Record<string, any>;
  user?: Record<string, any>;
  asset?: Record<string, any>;
  datetime?: Record<string, any>;
  custom?: Record<string, any>;
}

/**
 * Extract all variables from template content
 */
export function extractVariables(content: string, subject?: string): string[] {
  const allText = `${content} ${subject || ''}`;
  const variableRegex = /\{\{\s*([^}\s]+(?:\.[^}\s]+)*)\s*\}\}/g;
  const matches = [];
  let match;

  while ((match = variableRegex.exec(allText)) !== null) {
    const variable = match[1].trim();
    if (variable && isValidVariableName(variable)) {
      matches.push(variable);
    }
  }

  // Remove duplicates and sort
  return Array.from(new Set(matches)).sort();
}

/**
 * Get default variable values
 */
export function getDefaultVariableValues(): VariableData {
  const now = new Date();

  return {
    incident: {
      title: 'Unauthorized Database Access',
      severity: 'Critical',
      status: 'Contained',
      type: 'Data Breach',
      impactLevel: 'High',
      detectedAt: '2024-01-20 14:30 UTC',
      containedAt: '2024-01-20 16:15 UTC',
      description: 'Unauthorized access to customer database detected through compromised credentials.',
      affectedUsers: '1,247',
      reportedBy: 'Security Team',
    },
    organization: {
      name: 'Acme Corporation',
      contact: 'security@acme.com',
      phone: '+1-555-0100',
      website: 'https://acme.com',
      address: '123 Business Ave, City, State 12345',
      industry: 'Technology',
      complianceOfficer: 'Jane Smith',
    },
    user: {
      name: 'John Doe',
      email: 'john.doe@acme.com',
      role: 'Senior Security Analyst',
      department: 'Information Security',
      phone: '+1-555-0123',
      signature: 'Best regards,\nJohn Doe\nSenior Security Analyst',
    },
    asset: {
      name: 'Customer Database Server',
      type: 'Database Server',
      criticality: 'Critical',
      owner: 'Data Team',
      location: 'AWS US-East-1',
      dataClassification: 'Confidential',
      affectedRecords: '15,000 customer records',
    },
    datetime: {
      current: now.toISOString().replace('T', ' ').slice(0, -5) + ' UTC',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0] + ' UTC',
      timestamp: Math.floor(now.getTime() / 1000).toString(),
      reportDate: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      deadline: '72 hours from detection',
    },
  };
}

/**
 * Replace variables in template content
 */
export function replaceVariables(
  content: string,
  variableData: VariableData,
  customValues?: Record<string, string>
): { content: string; missingVariables: string[] } {
  let processedContent = content;
  const missingVariables: string[] = [];
  const processedVariables = new Set<string>();

  // Extract all variables
  const variables = extractVariables(content);

  variables.forEach(variable => {
    if (processedVariables.has(variable)) return;
    processedVariables.add(variable);

    const regex = new RegExp(`\\{\\{\\s*${escapeRegex(variable)}\\s*\\}\\}`, 'g');
    let replaced = false;

    // Check custom values first
    if (customValues && customValues[variable] !== undefined) {
      const value = customValues[variable];
      if (value !== null && value !== '') {
        processedContent = processedContent.replace(regex, value);
        replaced = true;
      }
    }

    if (!replaced) {
      // Parse variable path (e.g., "incident.title" -> category: "incident", field: "title")
      const [category, field] = variable.split('.');

      if (category && field && variableData[category as keyof VariableData]) {
        const categoryData = variableData[category as keyof VariableData] as Record<string, any>;
        const value = categoryData[field];

        if (value !== undefined && value !== null && value !== '') {
          processedContent = processedContent.replace(regex, value.toString());
          replaced = true;
        }
      }
    }

    if (!replaced) {
      missingVariables.push(variable);
    }
  });

  return { content: processedContent, missingVariables };
}

/**
 * Get variable data for a specific incident
 */
export function getIncidentVariableData(incidentData?: any): VariableData {
  const defaults = getDefaultVariableValues();

  if (!incidentData) {
    return defaults;
  }

  return {
    ...defaults,
    incident: {
      ...defaults.incident,
      ...incidentData,
    },
  };
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Format variable for display in UI
 */
export function formatVariableForDisplay(variable: string): string {
  return `{{${variable}}}`;
}

/**
 * Validate variable name format
 */
export function isValidVariableName(name: string): boolean {
  // Variable names should be in format: category.field (allowing camelCase and numbers)
  const variablePattern = /^[a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z][a-zA-Z0-9]*$/;
  return variablePattern.test(name) && name.length <= 50; // reasonable length limit
}

/**
 * Get variable category from variable name
 */
export function getVariableCategory(variableName: string): string | null {
  const [category] = variableName.split('.');
  return category || null;
}

/**
 * Get variable field from variable name
 */
export function getVariableField(variableName: string): string | null {
  const [, field] = variableName.split('.');
  return field || null;
}