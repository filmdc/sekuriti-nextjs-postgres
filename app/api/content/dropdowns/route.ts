import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

// This would normally come from a database
// For now, we'll use in-memory storage with default values
const defaultDropdowns = [
  {
    id: 'incident_severity',
    name: 'Incident Severity',
    key: 'incident_severity',
    description: 'Severity levels for incidents',
    isSystem: true,
    isActive: true,
    options: [
      { value: 'critical', label: 'Critical', description: 'Immediate action required' },
      { value: 'high', label: 'High', description: 'Urgent attention needed' },
      { value: 'medium', label: 'Medium', description: 'Standard priority' },
      { value: 'low', label: 'Low', description: 'Can be scheduled' },
    ],
  },
  {
    id: 'incident_type',
    name: 'Incident Type',
    key: 'incident_type',
    description: 'Types of security incidents',
    isSystem: true,
    isActive: true,
    options: [
      { value: 'data_breach', label: 'Data Breach' },
      { value: 'malware', label: 'Malware' },
      { value: 'phishing', label: 'Phishing' },
      { value: 'ddos', label: 'DDoS Attack' },
      { value: 'insider_threat', label: 'Insider Threat' },
      { value: 'ransomware', label: 'Ransomware' },
      { value: 'unauthorized_access', label: 'Unauthorized Access' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'asset_type',
    name: 'Asset Type',
    key: 'asset_type',
    description: 'Categories of organizational assets',
    isSystem: true,
    isActive: true,
    options: [
      { value: 'server', label: 'Server' },
      { value: 'workstation', label: 'Workstation' },
      { value: 'network_device', label: 'Network Device' },
      { value: 'application', label: 'Application' },
      { value: 'database', label: 'Database' },
      { value: 'cloud_service', label: 'Cloud Service' },
      { value: 'iot_device', label: 'IoT Device' },
      { value: 'mobile_device', label: 'Mobile Device' },
    ],
  },
  {
    id: 'asset_criticality',
    name: 'Asset Criticality',
    key: 'asset_criticality',
    description: 'Criticality levels for assets',
    isSystem: true,
    isActive: true,
    options: [
      { value: 'critical', label: 'Critical', description: 'Essential for operations' },
      { value: 'high', label: 'High', description: 'Important for business' },
      { value: 'medium', label: 'Medium', description: 'Standard importance' },
      { value: 'low', label: 'Low', description: 'Minimal impact if unavailable' },
    ],
  },
  {
    id: 'communication_channel',
    name: 'Communication Channel',
    key: 'communication_channel',
    description: 'Methods of communication',
    isSystem: true,
    isActive: true,
    options: [
      { value: 'email', label: 'Email' },
      { value: 'slack', label: 'Slack' },
      { value: 'teams', label: 'Microsoft Teams' },
      { value: 'phone', label: 'Phone' },
      { value: 'sms', label: 'SMS' },
      { value: 'in_person', label: 'In Person' },
      { value: 'video_call', label: 'Video Call' },
    ],
  },
  {
    id: 'runbook_phase',
    name: 'Runbook Phase',
    key: 'runbook_phase',
    description: 'Incident response phases',
    isSystem: true,
    isActive: true,
    options: [
      { value: 'detection', label: 'Detection & Analysis' },
      { value: 'containment', label: 'Containment' },
      { value: 'eradication', label: 'Eradication' },
      { value: 'recovery', label: 'Recovery' },
      { value: 'lessons_learned', label: 'Lessons Learned' },
    ],
  },
  {
    id: 'responsible_role',
    name: 'Responsible Role',
    key: 'responsible_role',
    description: 'Roles responsible for tasks',
    isSystem: true,
    isActive: true,
    options: [
      { value: 'incident_commander', label: 'Incident Commander' },
      { value: 'security_analyst', label: 'Security Analyst' },
      { value: 'network_admin', label: 'Network Administrator' },
      { value: 'system_admin', label: 'System Administrator' },
      { value: 'developer', label: 'Developer' },
      { value: 'manager', label: 'Manager' },
      { value: 'executive', label: 'Executive' },
      { value: 'legal', label: 'Legal' },
      { value: 'pr', label: 'Public Relations' },
    ],
  },
  {
    id: 'asset_status',
    name: 'Asset Status',
    key: 'asset_status',
    description: 'Operational status of assets',
    isSystem: true,
    isActive: true,
    options: [
      { value: 'active', label: 'Active', description: 'In use and operational' },
      { value: 'inactive', label: 'Inactive', description: 'Not currently in use' },
      { value: 'maintenance', label: 'Under Maintenance', description: 'Being serviced or updated' },
      { value: 'decommissioned', label: 'Decommissioned', description: 'Retired from service' },
      { value: 'disposed', label: 'Disposed', description: 'Physically removed/destroyed' },
    ],
  },
];

// In-memory storage for custom dropdowns (per organization)
const customDropdowns: Map<number, any[]> = new Map();

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // Get organization's custom dropdowns
    const orgDropdowns = customDropdowns.get(user.teamId) || [];

    // Combine system and custom dropdowns
    let allDropdowns = [...defaultDropdowns, ...orgDropdowns];

    // Filter by category if specified
    if (category) {
      allDropdowns = allDropdowns.filter(d => d.key === category);
    }

    return NextResponse.json({ dropdowns: allDropdowns });
  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dropdowns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, key, description, options } = body;

    if (!name || !key || !options || options.length === 0) {
      return NextResponse.json(
        { error: 'Name, key, and at least one option are required' },
        { status: 400 }
      );
    }

    // Check if key already exists
    const orgDropdowns = customDropdowns.get(user.teamId) || [];
    if (orgDropdowns.some(d => d.key === key) || defaultDropdowns.some(d => d.key === key)) {
      return NextResponse.json(
        { error: 'A dropdown with this key already exists' },
        { status: 400 }
      );
    }

    const newDropdown = {
      id: `custom_${Date.now()}`,
      name,
      key,
      description,
      options,
      isSystem: false,
      isActive: true,
      organizationId: user.teamId,
      createdAt: new Date(),
      createdBy: user.id,
    };

    // Add to organization's custom dropdowns
    const updatedDropdowns = [...orgDropdowns, newDropdown];
    customDropdowns.set(user.teamId, updatedDropdowns);

    return NextResponse.json(newDropdown, { status: 201 });
  } catch (error) {
    console.error('Error creating dropdown:', error);
    return NextResponse.json(
      { error: 'Failed to create dropdown' },
      { status: 500 }
    );
  }
}