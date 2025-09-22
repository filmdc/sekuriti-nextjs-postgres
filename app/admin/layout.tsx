import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import Link from 'next/link';
import {
  Shield,
  Building2,
  Users,
  Activity,
  Settings,
  CreditCard,
  BarChart3,
  LogOut,
  Home,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (!user.isSystemAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Admin Sidebar - Dark Theme */}
        <aside className="w-64 bg-gray-900 min-h-screen">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <h1 className="text-white font-bold text-lg">Sekuriti.io</h1>
                <p className="text-gray-400 text-xs">System Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <Link href="/admin/dashboard">
              <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer">
                <BarChart3 className="h-5 w-5" />
                <span className="ml-3">Dashboard</span>
              </div>
            </Link>
            <Link href="/admin/organizations">
              <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer">
                <Building2 className="h-5 w-5" />
                <span className="ml-3">Organizations</span>
              </div>
            </Link>
            <Link href="/admin/users">
              <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer">
                <Users className="h-5 w-5" />
                <span className="ml-3">Users</span>
              </div>
            </Link>
            <Link href="/admin/billing">
              <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer">
                <CreditCard className="h-5 w-5" />
                <span className="ml-3">Billing</span>
              </div>
            </Link>
            <Link href="/admin/activity">
              <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer">
                <Activity className="h-5 w-5" />
                <span className="ml-3">Activity Logs</span>
              </div>
            </Link>
            <Link href="/admin/settings">
              <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer">
                <Settings className="h-5 w-5" />
                <span className="ml-3">Settings</span>
              </div>
            </Link>
          </nav>

          {/* Bottom Section */}
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
            <div className="mb-4 px-4 py-2">
              <p className="text-gray-400 text-sm">System Administrator</p>
              <p className="text-white text-sm font-medium truncate">{user.email}</p>
            </div>
            <Link href="/">
              <div className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors cursor-pointer">
                <Home className="h-4 w-4" />
                <span className="ml-3 text-sm">Back to Dashboard</span>
              </div>
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                <LogOut className="h-4 w-4" />
                <span className="ml-3 text-sm">Sign Out</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">System Administration Portal</h2>
                <div className="text-sm text-gray-500">
                  Manage organizations, users, and system settings
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}