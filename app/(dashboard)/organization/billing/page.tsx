'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

interface BillingData {
  subscription: {
    id: string;
    status: string;
    plan: string;
    amount: number;
    interval: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
  };
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  invoices: {
    id: string;
    number: string;
    amount: number;
    status: string;
    date: string;
    pdfUrl: string;
  }[];
  usage: {
    teamMembers: { current: number; limit: number };
    incidents: { current: number; limit: number };
    storage: { current: number; limit: number };
  };
}

const plans = [
  {
    name: 'Starter',
    price: 49,
    interval: 'month',
    features: [
      'Up to 5 team members',
      '10 incidents per month',
      '5GB storage',
      'Email support',
      'Basic runbooks',
      'Activity logs'
    ],
    limits: {
      teamMembers: 5,
      incidents: 10,
      storage: 5
    }
  },
  {
    name: 'Professional',
    price: 149,
    interval: 'month',
    popular: true,
    features: [
      'Up to 20 team members',
      'Unlimited incidents',
      '50GB storage',
      'Priority support',
      'Advanced runbooks',
      'Custom workflows',
      'API access',
      'SSO integration'
    ],
    limits: {
      teamMembers: 20,
      incidents: -1,
      storage: 50
    }
  },
  {
    name: 'Enterprise',
    price: 499,
    interval: 'month',
    features: [
      'Unlimited team members',
      'Unlimited incidents',
      '500GB storage',
      'Dedicated support',
      'Custom runbooks',
      'Advanced analytics',
      'Full API access',
      'SSO & SAML',
      'Custom integrations',
      'SLA guarantee'
    ],
    limits: {
      teamMembers: -1,
      incidents: -1,
      storage: 500
    }
  }
];

export default function BillingPage() {
  const { toast } = useToast();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/organization/billing');
      if (response.ok) {
        const data = await response.json();
        setBillingData(data);
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setProcessingAction(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST'
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create portal session');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive'
      });
      setProcessingAction(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    setProcessingAction(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName.toLowerCase() })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start upgrade process',
        variant: 'destructive'
      });
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'trialing':
        return <Badge variant="secondary">Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = billingData?.subscription?.plan || 'Free';
  const isFreePlan = !billingData?.subscription || billingData.subscription.status === 'canceled';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/organization">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing information
            </p>
          </div>
        </div>
        {!isFreePlan && (
          <Button
            onClick={handleManageSubscription}
            disabled={processingAction}
          >
            {processingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Manage Billing
          </Button>
        )}
      </div>

      {/* Current Subscription */}
      {billingData?.subscription && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your active plan and billing details</CardDescription>
              </div>
              {getStatusBadge(billingData.subscription.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{billingData.subscription.plan}</p>
                  <p className="text-muted-foreground">
                    ${billingData.subscription.amount / 100}/{billingData.subscription.interval}
                  </p>
                </div>
                {billingData.subscription.trialEnd && (
                  <Alert className="max-w-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Trial Period</AlertTitle>
                    <AlertDescription>
                      Your trial ends on {format(new Date(billingData.subscription.trialEnd), 'PPP')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {billingData.subscription.cancelAtPeriodEnd && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Subscription Ending</AlertTitle>
                  <AlertDescription>
                    Your subscription will end on {format(new Date(billingData.subscription.currentPeriodEnd), 'PPP')}
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Next billing date</p>
                  <p className="font-medium">
                    {format(new Date(billingData.subscription.currentPeriodEnd), 'PPP')}
                  </p>
                </div>
                {billingData.paymentMethod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment method</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <p className="font-medium">
                        {billingData.paymentMethod.brand} •••• {billingData.paymentMethod.last4}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        Expires {billingData.paymentMethod.expMonth}/{billingData.paymentMethod.expYear}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage & Limits */}
      {billingData?.usage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>Your current usage against plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members
                  </span>
                  <span className="font-medium">
                    {billingData.usage.teamMembers.current}
                    {billingData.usage.teamMembers.limit !== -1 && ` / ${billingData.usage.teamMembers.limit}`}
                  </span>
                </div>
                {billingData.usage.teamMembers.limit !== -1 && (
                  <Progress
                    value={getUsagePercentage(billingData.usage.teamMembers.current, billingData.usage.teamMembers.limit)}
                    className="h-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Incidents This Month
                  </span>
                  <span className="font-medium">
                    {billingData.usage.incidents.current}
                    {billingData.usage.incidents.limit !== -1 ? ` / ${billingData.usage.incidents.limit}` : ' (Unlimited)'}
                  </span>
                </div>
                {billingData.usage.incidents.limit !== -1 && (
                  <Progress
                    value={getUsagePercentage(billingData.usage.incidents.current, billingData.usage.incidents.limit)}
                    className="h-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Storage Used
                  </span>
                  <span className="font-medium">
                    {billingData.usage.storage.current}GB
                    {billingData.usage.storage.limit !== -1 && ` / ${billingData.usage.storage.limit}GB`}
                  </span>
                </div>
                {billingData.usage.storage.limit !== -1 && (
                  <Progress
                    value={getUsagePercentage(billingData.usage.storage.current, billingData.usage.storage.limit)}
                    className="h-2"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-primary shadow-lg' : ''}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {currentPlan === plan.name ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={processingAction}
                  >
                    {processingAction && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Upgrade to {plan.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      {billingData?.invoices && billingData.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Your recent invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingData.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Invoice #{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.date), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">${(invoice.amount / 100).toFixed(2)}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(invoice.pdfUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}