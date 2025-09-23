import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, users } from '@/lib/db/schema';
import { incidents } from '@/lib/db/schema-ir';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { template, incidentId, customVariables } = body;

    if (!template) {
      return NextResponse.json(
        { error: 'Template content required' },
        { status: 400 }
      );
    }

    // Extract variables from template
    const variableRegex = /{{([^}]+)}}/g;
    const matches = Array.from(new Set(template.match(variableRegex) || []));
    const variables = matches.map(match => match.replace(/{{|}}/g, '').trim());

    // Prepare variable values
    const variableValues: Record<string, any> = {};

    // Fetch incident data if provided
    if (incidentId) {
      const [incident] = await db
        .select()
        .from(incidents)
        .where(eq(incidents.id, incidentId))
        .limit(1);

      if (incident) {
        variableValues['incident.title'] = incident.title;
        variableValues['incident.severity'] = incident.severity;
        variableValues['incident.status'] = incident.status;
        variableValues['incident.description'] = incident.description;
        variableValues['incident.detectedAt'] = incident.detectedAt?.toISOString();
        variableValues['incident.referenceNumber'] = incident.referenceNumber;
      }
    }

    // Fetch organization data
    if (user.teamId) {
      const [organization] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, user.teamId))
        .limit(1);

      if (organization) {
        variableValues['organization.name'] = organization.name;
        // Add more organization fields as needed
      }
    }

    // Fetch current user data
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (currentUser) {
      variableValues['user.name'] = currentUser.name;
      variableValues['user.email'] = currentUser.email;
      // Add role if available
    }

    // Add datetime variables
    const now = new Date();
    variableValues['datetime.current'] = now.toISOString().replace('T', ' ').slice(0, -5) + ' UTC';
    variableValues['datetime.date'] = now.toISOString().split('T')[0];
    variableValues['datetime.time'] = now.toTimeString().split(' ')[0] + ' UTC';

    // Add custom variables if provided
    if (customVariables) {
      Object.assign(variableValues, customVariables);
    }

    // Process the template
    let processedTemplate = template;
    variables.forEach(variable => {
      const value = variableValues[variable];
      if (value !== undefined) {
        const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g');
        processedTemplate = processedTemplate.replace(regex, value);
      }
    });

    // Identify missing variables
    const missingVariables = variables.filter(
      variable => variableValues[variable] === undefined
    );

    return NextResponse.json({
      processedTemplate,
      variables,
      variableValues,
      missingVariables,
    });
  } catch (error) {
    console.error('Error processing variables:', error);
    return NextResponse.json(
      { error: 'Failed to process variables' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return available variable definitions
    const availableVariables = {
      incident: [
        { key: 'incident.title', label: 'Incident Title', example: 'Data Breach Investigation' },
        { key: 'incident.severity', label: 'Severity', example: 'Critical' },
        { key: 'incident.status', label: 'Status', example: 'Contained' },
        { key: 'incident.detectedAt', label: 'Detection Time', example: '2024-01-20 14:30 UTC' },
        { key: 'incident.description', label: 'Description', example: 'Unauthorized access detected...' },
        { key: 'incident.referenceNumber', label: 'Reference Number', example: 'INC-2024-001' },
        { key: 'incident.classification', label: 'Classification', example: 'data_breach' },
      ],
      organization: [
        { key: 'organization.name', label: 'Organization Name', example: 'Acme Corporation' },
        { key: 'organization.contact', label: 'Contact Email', example: 'security@acme.com' },
        { key: 'organization.phone', label: 'Contact Phone', example: '+1-555-0100' },
        { key: 'organization.website', label: 'Website', example: 'https://acme.com' },
        { key: 'organization.address', label: 'Address', example: '123 Main St, City, State' },
      ],
      user: [
        { key: 'user.name', label: 'Current User', example: 'John Doe' },
        { key: 'user.email', label: 'User Email', example: 'john@acme.com' },
        { key: 'user.role', label: 'User Role', example: 'Security Analyst' },
        { key: 'user.title', label: 'User Title', example: 'Senior Security Engineer' },
      ],
      datetime: [
        { key: 'datetime.current', label: 'Current Date/Time', example: '2024-01-20 15:45 UTC' },
        { key: 'datetime.date', label: 'Current Date', example: '2024-01-20' },
        { key: 'datetime.time', label: 'Current Time', example: '15:45 UTC' },
        { key: 'datetime.timestamp', label: 'Unix Timestamp', example: '1705765500' },
      ],
      asset: [
        { key: 'asset.name', label: 'Asset Name', example: 'Production Server' },
        { key: 'asset.type', label: 'Asset Type', example: 'hardware' },
        { key: 'asset.identifier', label: 'Asset ID', example: 'SRV-001' },
        { key: 'asset.location', label: 'Asset Location', example: 'Data Center A' },
        { key: 'asset.criticality', label: 'Asset Criticality', example: 'high' },
      ],
    };

    return NextResponse.json({ variables: availableVariables });
  } catch (error) {
    console.error('Error fetching variables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variables' },
      { status: 500 }
    );
  }
}