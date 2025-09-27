'use client';

import { DataManagementControls } from '@/components/data-management/data-management-controls';
import { importTeamMembersAction } from '@/lib/actions/data-import';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface TeamMemberListClientProps {
  members: any[];
}

export function TeamMemberListClient({ members }: TeamMemberListClientProps) {
  const router = useRouter();

  const handleImport = async (data: any[], format: 'csv' | 'json' | 'excel') => {
    try {
      const result = await importTeamMembersAction(data, format);

      if (result.success > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.success} team members${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        });
        router.refresh();
      }

      if (result.failed > 0 && result.errors) {
        const errorMessages = result.errors.slice(0, 3).map(e => e.error).join(', ');
        toast({
          title: 'Import Partially Failed',
          description: `${result.failed} members failed to import: ${errorMessages}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import team members',
        variant: 'destructive'
      });
    }
  };

  const validateMemberRow = (row: any) => {
    const errors = [];

    if (!row.email && !row.Email) {
      errors.push('Email is required');
    } else {
      const email = row.email || row.Email;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
      }
    }

    const validRoles = ['owner', 'admin', 'member'];
    const role = (row.role || row.Role || '').toLowerCase();
    if (role && !validRoles.includes(role)) {
      errors.push(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  };

  const exportData = members.map((member) => ({
    id: member.id,
    name: member.user?.name || '',
    email: member.user?.email || '',
    role: member.role,
    title: member.user?.title || '',
    department: member.user?.department || '',
    phone: member.user?.phone || '',
    isOrganizationAdmin: member.user?.isOrganizationAdmin || false,
    lastLoginAt: member.user?.lastLoginAt ? new Date(member.user.lastLoginAt).toISOString() : '',
    joinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString() : '',
    createdAt: member.user?.createdAt ? new Date(member.user.createdAt).toISOString() : ''
  }));

  return (
    <div className="mb-4">
      <DataManagementControls
        data={exportData}
        filename={`team-members-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'title', label: 'Title' },
          { key: 'department', label: 'Department' },
          { key: 'phone', label: 'Phone' },
          { key: 'isOrganizationAdmin', label: 'Org Admin', formatter: (v) => v ? 'Yes' : 'No' },
          { key: 'lastLoginAt', label: 'Last Login' },
          { key: 'joinedAt', label: 'Joined' }
        ]}
        entityName="Team Members"
        templateColumns={[
          { key: 'email', label: 'Email', required: true, type: 'string', example: 'john.doe@example.com' },
          { key: 'name', label: 'Name', type: 'string', example: 'John Doe' },
          { key: 'role', label: 'Role', type: 'string', example: 'owner, admin, member' },
          { key: 'title', label: 'Job Title', type: 'string', example: 'Security Analyst' },
          { key: 'department', label: 'Department', type: 'string', example: 'Security Operations' },
          { key: 'phone', label: 'Phone', type: 'string', example: '+1-555-0123' }
        ]}
        onImport={handleImport}
        validateRow={validateMemberRow}
        maxRows={500}
      />
    </div>
  );
}