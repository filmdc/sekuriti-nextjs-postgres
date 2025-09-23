'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UsageWidget } from '@/components/quota/usage-widget';
import { QuotaProgressBar } from '@/components/quota/quota-progress-bar';
import { FeatureGate } from '@/components/quota/feature-gate';
import { useOrganizationLimits, useOrganizationUsage } from '@/lib/hooks/use-organization-limits';
import { formatStorage, LicenseType, DEFAULT_LIMITS } from '@/lib/types/license';
import { toast } from 'sonner';
import {
  CreditCard,
  ChevronLeft,
  Download,
  Calendar,
  Users,
  Shield,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Receipt,
  TrendingUp,
  Package,
  Zap,
  Sparkles,
  Lock,
  Server,
  Database,
  FileText,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  date: string;
  pdfUrl: string;
}

const LICENSE_PLANS: Record<LicenseType, {
  name: string;
  price: number;
  interval: string;
  popular?: boolean;
  features: string[];
  limits: typeof DEFAULT_LIMITS.STARTER;
}> = {
  STARTER: {
    name: 'Starter',
    price: 49,
    interval: 'month',
    features: [
      'Up to 5 team members',
      '100 incidents',
      '500 assets',
      '50 runbooks',
      '1GB storage',
      'Email support',
      'Basic reporting',
      'Activity logs'
    ],
    limits: DEFAULT_LIMITS.STARTER
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 199,
    interval: 'month',
    popular: true,
    features: [
      'Up to 25 team members',
      '1,000 incidents',
      '5,000 assets',
      '500 runbooks',
      '10GB storage',
      'Priority support',
      'Advanced reporting',
      'Custom domains',
      'API access',
      'Audit logs',
      'Bulk operations'
    ],
    limits: DEFAULT_LIMITS.PROFESSIONAL
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 0, // Custom pricing
    interval: 'custom',
    features: [
      'Unlimited team members',
      'Unlimited incidents',
      'Unlimited assets',
      'Unlimited runbooks',
      'Unlimited storage',
      'Dedicated support',
      'Custom integrations',
      'White-labeling',
      'SSO & SAML',
      'SLA guarantee',
      'Custom training'
    ],
    limits: DEFAULT_LIMITS.ENTERPRISE
  }
};

function PlanCard({
  plan,
  currentPlan,
  onUpgrade
}: {
  plan: typeof LICENSE_PLANS.STARTER & { type: LicenseType };
  currentPlan: LicenseType;
  onUpgrade: (plan: LicenseType) => void;
}) {
  const isCurrent = currentPlan === plan.type;
  const isUpgrade = plan.type > currentPlan;

  return (
    <Card className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="mt-4">
          {plan.price > 0 ? (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground ml-2">/{plan.interval}</span>
            </div>
          ) : (
            <div className="text-2xl font-bold">Contact Sales</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <Button
          className="w-full"
          variant={isCurrent ? 'outline' : isUpgrade ? 'default' : 'secondary'}
          disabled={isCurrent}
          onClick={() => onUpgrade(plan.type)}
        >
          {isCurrent ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Current Plan
            </>
          ) : isUpgrade ? (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade
            </>
          ) : plan.type === 'ENTERPRISE' ? (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Sales
            </>
          ) : (
            'Select Plan'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function UsageDetails() {
  const { limits } = useOrganizationLimits();
  const { usage } = useOrganizationUsage();

  if (!limits || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading usage data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const resources = [
    {
      name: 'Team Members',
      icon: <Users className="h-4 w-4" />,
      current: usage.users,
      limit: limits.maxUsers,
    },
    {
      name: 'Incidents',
      icon: <Shield className="h-4 w-4" />,
      current: usage.incidents,
      limit: limits.maxIncidents,
    },
    {
      name: 'Assets',
      icon: <Server className="h-4 w-4" />,
      current: usage.assets,
      limit: limits.maxAssets,
    },
    {
      name: 'Runbooks',
      icon: <FileText className="h-4 w-4" />,
      current: usage.runbooks,
      limit: limits.maxRunbooks,
    },
    {
      name: 'Templates',
      icon: <MessageSquare className="h-4 w-4" />,
      current: usage.templates,
      limit: limits.maxTemplates,
    },
    {
      name: 'Storage',
      icon: <Database className="h-4 w-4" />,
      current: usage.storageMb,
      limit: limits.maxStorageMb,
      formatter: formatStorage,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Usage</CardTitle>
        <CardDescription>Current consumption across all resources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {resource.icon}
                <span className="font-medium">{resource.name}</span>
              </div>
              <span className="text-muted-foreground">
                {resource.formatter ? resource.formatter(resource.current) : resource.current}
                {resource.limit && (
                  <> / {resource.formatter ? resource.formatter(resource.limit) : resource.limit}</>
                )}
                {!resource.limit && ' (Unlimited)'}
              </span>
            </div>
            <QuotaProgressBar
              current={resource.current}
              limit={resource.limit}
              showIcon={false}
              showValues={false}
              formatter={resource.formatter}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function EnhancedBillingPage() {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { limits } = useOrganizationLimits();
  const { data: team } = useSWR('/api/team', fetcher);
  const { data: invoices } = useSWR<Invoice[]>('/api/organization/billing/invoices', fetcher);

  // Determine current license type based on team data or limits
  const currentLicense: LicenseType = team?.licenseType || 'STARTER';

  const handleUpgrade = async (plan: LicenseType) => {
    if (plan === 'ENTERPRISE') {
      window.location.href = '/contact-sales';
      return;
    }

    setIsUpgrading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error('Failed to initiate upgrade. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error('Failed to open customer portal. Please try again.');
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/organization">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Billing & Usage</h2>
          <p className="text-muted-foreground">
            Manage your subscription and monitor resource usage
          </p>
        </div>
        <Button onClick={handleManageSubscription}>
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Subscription
        </Button>
      </div>

      {/* Current Plan Alert */}
      {currentLicense === 'STARTER' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited Plan</AlertTitle>
          <AlertDescription>
            You're on the Starter plan. Upgrade to Professional or Enterprise for advanced features and higher limits.
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {limits && (
            <UsageWidget
              limits={limits}
              showUpgradeButton={currentLicense !== 'ENTERPRISE'}
            />
          )}
        </div>
        <UsageDetails />
      </div>

      {/* Pricing Plans */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
        <div className="grid gap-6 lg:grid-cols-3">
          {Object.entries(LICENSE_PLANS).map(([type, plan]) => (
            <PlanCard
              key={type}
              plan={{ ...plan, type: type as LicenseType }}
              currentPlan={currentLicense}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download your past invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${(invoice.amount / 100).toFixed(2)}</span>
                    <Badge variant={invoice.status === 'paid' ? 'success' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2" />
              <p>No invoices yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <FeatureGate
        feature="customDomains"
        licenseType={currentLicense}
        fallback={
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Custom Domains
              </CardTitle>
              <CardDescription>
                Available in Professional and Enterprise plans
              </CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Custom Domains</CardTitle>
            <CardDescription>Configure your custom domain for the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Configure Domain</Button>
          </CardContent>
        </Card>
      </FeatureGate>
    </div>
  );
}