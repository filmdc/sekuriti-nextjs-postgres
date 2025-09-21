'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  Shield,
  CreditCard,
  FileText,
  Activity,
  Settings,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Globe,
  Phone,
  Mail
} from 'lucide-react';

interface OrganizationData {
  id: number;
  name: string;
  industry: string;
  size: string;
  address: string;
  phone: string;
  website: string;
  planName: string;
  subscriptionStatus: string;
  memberCount: number;
  activeIncidents: number;
  insurancePolicies: number;
  complianceTags: number;
}

export default function OrganizationPage() {
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const response = await fetch('/api/organization');
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
      }
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Unable to load organization data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickStats = [
    {
      title: 'Team Members',
      value: organization.memberCount || 0,
      icon: Users,
      link: '/organization/team',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Active Incidents',
      value: organization.activeIncidents || 0,
      icon: AlertTriangle,
      link: '/incidents',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Insurance Policies',
      value: organization.insurancePolicies || 0,
      icon: Shield,
      link: '/organization/insurance',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Compliance Tags',
      value: organization.complianceTags || 0,
      icon: Tag,
      link: '/organization/tags',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const settingsCards = [
    {
      title: 'General Settings',
      description: 'Manage organization profile, industry, and contact information',
      icon: Settings,
      link: '/organization/settings',
      badge: null
    },
    {
      title: 'Team Management',
      description: 'Invite members, assign roles, and manage permissions',
      icon: Users,
      link: '/organization/team',
      badge: `${organization.memberCount} members`
    },
    {
      title: 'Insurance Policies',
      description: 'Track insurance coverage and manage policy documents',
      icon: Shield,
      link: '/organization/insurance',
      badge: organization.insurancePolicies > 0 ? `${organization.insurancePolicies} active` : null
    },
    {
      title: 'Billing & Subscription',
      description: 'View billing details, invoices, and manage subscription',
      icon: CreditCard,
      link: '/organization/billing',
      badge: organization.planName
    },
    {
      title: 'Audit Logs',
      description: 'Review activity logs and track system changes',
      icon: FileText,
      link: '/organization/audit',
      badge: null
    },
    {
      title: 'Tag Governance',
      description: 'Manage tags, create policies, and ensure consistency',
      icon: Tag,
      link: '/organization/tags',
      badge: `${organization.complianceTags} tags`
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization settings and configuration
          </p>
        </div>
        <Button asChild>
          <Link href="/organization/settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Organization Info Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Your organization profile and subscription</CardDescription>
            </div>
            <Badge variant={
              organization.subscriptionStatus === 'active' ? 'default' :
              organization.subscriptionStatus === 'trialing' ? 'secondary' : 'destructive'
            }>
              {organization.subscriptionStatus || 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium">{organization.industry || 'Not specified'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Company Size</p>
              <p className="font-medium capitalize">{organization.size || 'Not specified'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-medium">{organization.planName || 'Free Plan'}</p>
            </div>
            {organization.phone && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="font-medium">{organization.phone}</p>
              </div>
            )}
            {organization.website && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Website
                </p>
                <p className="font-medium">{organization.website}</p>
              </div>
            )}
            {organization.address && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{organization.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Settings Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Organization Settings</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingsCards.map((card) => (
            <Link key={card.title} href={card.link}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <card.icon className="h-8 w-8 text-primary" />
                    {card.badge && (
                      <Badge variant="secondary">{card.badge}</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/organization/audit">
                View All
                <Activity className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Recent organization activity will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}