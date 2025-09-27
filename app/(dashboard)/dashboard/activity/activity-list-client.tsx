'use client';

import { DataManagementControls } from '@/components/data-management/data-management-controls';

interface ActivityListClientProps {
  logs: any[];
}

export function ActivityListClient({ logs }: ActivityListClientProps) {
  // Activity logs are typically read-only, so we only support export
  const exportData = logs.map((log) => ({
    id: log.id,
    action: log.action,
    userName: log.user?.name || '',
    userEmail: log.user?.email || '',
    timestamp: new Date(log.timestamp).toISOString(),
    ipAddress: log.ipAddress || '',
    details: log.details || ''
  }));

  return (
    <div className="mb-4">
      <DataManagementControls
        data={exportData}
        filename={`activity-logs-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'timestamp', label: 'Timestamp' },
          { key: 'action', label: 'Action' },
          { key: 'userName', label: 'User Name' },
          { key: 'userEmail', label: 'User Email' },
          { key: 'ipAddress', label: 'IP Address' },
          { key: 'details', label: 'Details' }
        ]}
        entityName="Activity Logs"
        onImport={async () => {}} // Activity logs are read-only
        showImport={false} // Disable import for activity logs
        showExport={true}
      />
    </div>
  );
}