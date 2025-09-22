import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold">System Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Public Site
                </Button>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-white min-h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-2">
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/organizations">
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Organizations
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            </Link>
            <Link href="/admin/billing">
              <Button variant="ghost" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>
            </Link>
            <Link href="/admin/activity">
              <Button variant="ghost" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Activity Logs
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}