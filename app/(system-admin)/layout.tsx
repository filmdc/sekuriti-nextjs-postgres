import { requireSystemAdmin } from '@/lib/auth/system-admin';
import { Toaster } from '@/components/ui/toaster';
import { SystemAdminSidebar } from '@/components/system-admin/sidebar';

export default async function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSystemAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex h-screen">
        {/* System Admin Sidebar */}
        <SystemAdminSidebar user={user} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  System Administration Portal
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage organizations, users, and system settings
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                  SYSTEM ADMIN
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}