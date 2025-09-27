'use client';

import { DataManagementControls } from '@/components/data-management/data-management-controls';

interface UserListClientProps {
  users: any[];
}

export function UserListClient({ users }: UserListClientProps) {
  // Users are typically managed through the admin panel, export-only for now
  const exportData = users.map((user) => ({
    id: user.id,
    name: user.name || '',
    email: user.email,
    role: user.role || 'member',
    title: user.title || '',
    department: user.department || '',
    phone: user.phone || '',
    isOrganizationAdmin: user.isOrganizationAdmin || false,
    isSystemAdmin: user.isSystemAdmin || false,
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : '',
    organizationCount: user.organizationCount || 0,
    createdAt: new Date(user.createdAt).toISOString(),
    updatedAt: new Date(user.updatedAt).toISOString()
  }));

  return (
    <div className="mb-4">
      <DataManagementControls
        data={exportData}
        filename={`users-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'title', label: 'Title' },
          { key: 'department', label: 'Department' },
          { key: 'phone', label: 'Phone' },
          { key: 'isOrganizationAdmin', label: 'Org Admin', formatter: (v) => v ? 'Yes' : 'No' },
          { key: 'isSystemAdmin', label: 'System Admin', formatter: (v) => v ? 'Yes' : 'No' },
          { key: 'lastLoginAt', label: 'Last Login' },
          { key: 'organizationCount', label: 'Organizations' },
          { key: 'createdAt', label: 'Created' }
        ]}
        entityName="Users"
        onImport={async () => {}} // Users require special handling for security
        showImport={false} // Disable import for users for security reasons
        showExport={true}
      />
    </div>
  );
}