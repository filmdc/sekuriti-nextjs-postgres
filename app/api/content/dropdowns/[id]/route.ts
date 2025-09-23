import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

// This would normally come from a database
// For now, we'll use the same in-memory storage
// Share the same default dropdowns with the main route
// In a real implementation, this would be in a shared module or database
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
  // Add other system dropdowns as needed
];

// In-memory storage for custom dropdowns (shared with main route)
const customDropdowns: Map<number, any[]> = new Map();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, options, isActive } = body;

    // Check if it's a system dropdown
    const systemDropdown = defaultDropdowns.find(d => d.id === params.id);
    if (systemDropdown) {
      // For system dropdowns, only allow updating options
      if (options) {
        systemDropdown.options = options;
      }
      return NextResponse.json(systemDropdown);
    }

    // Check custom dropdowns
    const orgDropdowns = customDropdowns.get(user.teamId) || [];
    const dropdownIndex = orgDropdowns.findIndex(d => d.id === params.id);

    if (dropdownIndex === -1) {
      return NextResponse.json(
        { error: 'Dropdown not found' },
        { status: 404 }
      );
    }

    // Update the dropdown
    const updatedDropdown = {
      ...orgDropdowns[dropdownIndex],
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(options !== undefined && { options }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
      updatedBy: user.id,
    };

    orgDropdowns[dropdownIndex] = updatedDropdown;
    customDropdowns.set(user.teamId, orgDropdowns);

    return NextResponse.json(updatedDropdown);
  } catch (error) {
    console.error('Error updating dropdown:', error);
    return NextResponse.json(
      { error: 'Failed to update dropdown' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cannot delete system dropdowns
    if (defaultDropdowns.some(d => d.id === params.id)) {
      return NextResponse.json(
        { error: 'Cannot delete system dropdowns' },
        { status: 403 }
      );
    }

    // Delete from custom dropdowns
    const orgDropdowns = customDropdowns.get(user.teamId) || [];
    const filteredDropdowns = orgDropdowns.filter(d => d.id !== params.id);

    if (filteredDropdowns.length === orgDropdowns.length) {
      return NextResponse.json(
        { error: 'Dropdown not found' },
        { status: 404 }
      );
    }

    customDropdowns.set(user.teamId, filteredDropdowns);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dropdown:', error);
    return NextResponse.json(
      { error: 'Failed to delete dropdown' },
      { status: 500 }
    );
  }
}