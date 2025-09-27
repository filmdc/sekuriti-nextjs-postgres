'use client';

import { DataManagementControls } from '@/components/data-management/data-management-controls';

interface OrganizationListClientProps {
  organizations: any[];
}

export function OrganizationListClient({ organizations }: OrganizationListClientProps) {
  // Organizations are typically managed through the admin panel, export-only for now
  const exportData = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    status: org.status || 'active',
    industry: org.industry || '',
    size: org.size || '',
    phone: org.phone || '',
    website: org.website || '',
    customDomain: org.customDomain || '',
    planName: org.planName || 'free',
    subscriptionStatus: org.subscriptionStatus || '',
    trialEndsAt: org.trialEndsAt ? new Date(org.trialEndsAt).toISOString() : '',
    memberCount: org.memberCount || 0,
    createdAt: new Date(org.createdAt).toISOString(),
    updatedAt: new Date(org.updatedAt).toISOString()
  }));

  return (
    <div className="mb-4">
      <DataManagementControls
        data={exportData}
        filename={`organizations-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
          { key: 'industry', label: 'Industry' },
          { key: 'size', label: 'Size' },
          { key: 'phone', label: 'Phone' },
          { key: 'website', label: 'Website' },
          { key: 'customDomain', label: 'Custom Domain' },
          { key: 'planName', label: 'Plan' },
          { key: 'subscriptionStatus', label: 'Subscription Status' },
          { key: 'trialEndsAt', label: 'Trial Ends' },
          { key: 'memberCount', label: 'Members' },
          { key: 'createdAt', label: 'Created' }
        ]}
        entityName="Organizations"
        onImport={async () => {}} // Organizations require special handling
        showImport={false} // Disable import for organizations for now
        showExport={true}
      />
    </div>
  );
}