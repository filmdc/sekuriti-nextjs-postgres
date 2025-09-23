'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  CreditCard,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  Copy,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Clock,
  Package,
  Settings,
  DollarSign,
  Percent,
  Calendar,
  AlertCircle,
  Info,
  Star,
} from 'lucide-react';

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number | 'unlimited';
  unit?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: PlanFeature[];
  limits: {
    users: number | 'unlimited';
    incidents: number | 'unlimited';
    assets: number | 'unlimited';
    storage: number; // in GB
    apiCalls: number | 'unlimited';
  };
  status: 'active' | 'inactive' | 'legacy';
  isPopular: boolean;
  trialDays: number;
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  subscribers: number;
  revenue: {
    monthly: number;
    yearly: number;
  };
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Mock data for demonstration
    const mockPlans: Plan[] = [
      {
        id: 'plan_starter',
        name: 'Starter',
        description: 'Perfect for small teams getting started with incident response',
        price: {
          monthly: 127,
          yearly: 1270,
          currency: 'USD',
        },
        features: [
          { id: 'f1', name: 'User Seats', description: 'Team member access', included: true, limit: 5, unit: 'users' },
          { id: 'f2', name: 'Incidents', description: 'Monthly incident limit', included: true, limit: 10, unit: 'per month' },
          { id: 'f3', name: 'Asset Management', description: 'Track assets', included: true, limit: 100, unit: 'assets' },
          { id: 'f4', name: 'Basic Runbooks', description: 'Pre-built response templates', included: true },
          { id: 'f5', name: 'Email Support', description: '24-hour response time', included: true },
          { id: 'f6', name: 'API Access', description: 'Programmatic access', included: false },
          { id: 'f7', name: 'Advanced Analytics', description: 'Detailed reports', included: false },
        ],
        limits: {
          users: 5,
          incidents: 10,
          assets: 100,
          storage: 5,
          apiCalls: 1000,
        },
        status: 'active',
        isPopular: false,
        trialDays: 14,
        stripeProductId: 'prod_starter',
        stripePriceIdMonthly: 'price_starter_monthly',
        stripePriceIdYearly: 'price_starter_yearly',
        subscribers: 82,
        revenue: {
          monthly: 10414,
          yearly: 104140,
        },
      },
      {
        id: 'plan_professional',
        name: 'Professional',
        description: 'Advanced features for growing security teams',
        price: {
          monthly: 500,
          yearly: 5000,
          currency: 'USD',
        },
        features: [
          { id: 'f1', name: 'User Seats', description: 'Team member access', included: true, limit: 20, unit: 'users' },
          { id: 'f2', name: 'Incidents', description: 'Monthly incident limit', included: true, limit: 'unlimited' },
          { id: 'f3', name: 'Asset Management', description: 'Track assets', included: true, limit: 'unlimited' },
          { id: 'f4', name: 'Advanced Runbooks', description: 'Custom workflows', included: true },
          { id: 'f5', name: 'Priority Support', description: '4-hour response time', included: true },
          { id: 'f6', name: 'API Access', description: 'Full API access', included: true },
          { id: 'f7', name: 'Advanced Analytics', description: 'Detailed reports & dashboards', included: true },
          { id: 'f8', name: 'Custom Integrations', description: 'Connect third-party tools', included: true },
        ],
        limits: {
          users: 20,
          incidents: 'unlimited',
          assets: 'unlimited',
          storage: 50,
          apiCalls: 50000,
        },
        status: 'active',
        isPopular: true,
        trialDays: 30,
        stripeProductId: 'prod_professional',
        stripePriceIdMonthly: 'price_professional_monthly',
        stripePriceIdYearly: 'price_professional_yearly',
        subscribers: 80,
        revenue: {
          monthly: 40000,
          yearly: 400000,
        },
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        description: 'Complete solution for large organizations',
        price: {
          monthly: 3000,
          yearly: 30000,
          currency: 'USD',
        },
        features: [
          { id: 'f1', name: 'User Seats', description: 'Unlimited team access', included: true, limit: 'unlimited' },
          { id: 'f2', name: 'Incidents', description: 'No limits', included: true, limit: 'unlimited' },
          { id: 'f3', name: 'Asset Management', description: 'Unlimited assets', included: true, limit: 'unlimited' },
          { id: 'f4', name: 'Custom Workflows', description: 'Fully customizable', included: true },
          { id: 'f5', name: 'Dedicated Support', description: 'Dedicated account manager', included: true },
          { id: 'f6', name: 'API Access', description: 'Unlimited API access', included: true, limit: 'unlimited' },
          { id: 'f7', name: 'White-label Options', description: 'Custom branding', included: true },
          { id: 'f8', name: 'SLA Guarantees', description: '99.99% uptime', included: true },
          { id: 'f9', name: 'Compliance Reports', description: 'SOC2, ISO certified', included: true },
        ],
        limits: {
          users: 'unlimited',
          incidents: 'unlimited',
          assets: 'unlimited',
          storage: 500,
          apiCalls: 'unlimited',
        },
        status: 'active',
        isPopular: false,
        trialDays: 30,
        stripeProductId: 'prod_enterprise',
        stripePriceIdMonthly: 'price_enterprise_monthly',
        stripePriceIdYearly: 'price_enterprise_yearly',
        subscribers: 25,
        revenue: {
          monthly: 75000,
          yearly: 750000,
        },
      },
    ];

    setTimeout(() => {
      setPlans(mockPlans);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleDuplicatePlan = (plan: Plan) => {
    const newPlan = {
      ...plan,
      id: `${plan.id}_copy`,
      name: `${plan.name} (Copy)`,
      status: 'inactive' as const,
      subscribers: 0,
      revenue: { monthly: 0, yearly: 0 },
    };
    setPlans([...plans, newPlan]);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      inactive: 'secondary',
      legacy: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 mt-1">
            Configure pricing tiers and feature sets
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total MRR</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(plans.reduce((sum, plan) => sum + plan.revenue.monthly, 0))}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Subscribers</p>
                    <p className="text-2xl font-bold">
                      {plans.reduce((sum, plan) => sum + plan.subscribers, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Revenue/User</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        plans.reduce((sum, plan) => sum + plan.revenue.monthly, 0) /
                        plans.reduce((sum, plan) => sum + plan.subscribers, 0)
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={plan.isPopular ? 'ring-2 ring-red-600' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </div>
                    {plan.isPopular && (
                      <Badge className="bg-red-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{formatCurrency(plan.price.monthly)}</span>
                      <span className="text-gray-500 ml-2">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      or {formatCurrency(plan.price.yearly)}/year (save 20%)
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Status</span>
                      {getStatusBadge(plan.status)}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Subscribers</span>
                      <span className="text-sm font-medium">{plan.subscribers}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Monthly Revenue</span>
                      <span className="text-sm font-medium">{formatCurrency(plan.revenue.monthly)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Trial Period</span>
                      <span className="text-sm font-medium">{plan.trialDays} days</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Key Features</p>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 5).map((feature) => (
                        <li key={feature.id} className="flex items-center text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <X className="h-4 w-4 text-gray-300 mr-2" />
                          )}
                          <span className={feature.included ? '' : 'text-gray-400'}>
                            {feature.name}
                            {feature.limit && feature.limit !== 'unlimited' && (
                              <span className="text-gray-500 ml-1">
                                ({feature.limit} {feature.unit})
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicatePlan(plan)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>
                Compare features and limits across all plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Feature</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="text-center p-4">
                          <div>
                            <p className="font-semibold">{plan.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(plan.price.monthly)}/mo
                            </p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-gray-50">
                      <td className="p-4 font-medium">User Seats</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.limits.users === 'unlimited' ? (
                            <Badge variant="secondary">Unlimited</Badge>
                          ) : (
                            <span>{plan.limits.users}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Monthly Incidents</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.limits.incidents === 'unlimited' ? (
                            <Badge variant="secondary">Unlimited</Badge>
                          ) : (
                            <span>{plan.limits.incidents}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="p-4 font-medium">Assets</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.limits.assets === 'unlimited' ? (
                            <Badge variant="secondary">Unlimited</Badge>
                          ) : (
                            <span>{plan.limits.assets}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Storage (GB)</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.limits.storage}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td className="p-4 font-medium">API Calls/month</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="text-center p-4">
                          {plan.limits.apiCalls === 'unlimited' ? (
                            <Badge variant="secondary">Unlimited</Badge>
                          ) : (
                            <span>{plan.limits.apiCalls.toLocaleString()}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    {/* Feature rows */}
                    {['API Access', 'Advanced Analytics', 'Custom Integrations', 'White-label Options'].map((featureName) => (
                      <tr key={featureName} className="border-b">
                        <td className="p-4 font-medium">{featureName}</td>
                        {plans.map((plan) => {
                          const feature = plan.features.find(f => f.name === featureName);
                          return (
                            <td key={plan.id} className="text-center p-4">
                              {feature?.included ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-gray-300 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules & Discounts</CardTitle>
              <CardDescription>
                Configure automatic discounts and pricing adjustments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Annual Discount</h3>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Customers save when paying annually
                  </p>
                  <Input type="number" defaultValue="20" className="w-24" />
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Volume Discounts</h3>
                    </div>
                    <Switch />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Automatic discounts for bulk licenses
                  </p>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">Free Trial</h3>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Allow new users to try before buying
                  </p>
                  <Select defaultValue="14">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <h3 className="font-medium">Grace Period</h3>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Days before canceling overdue accounts
                  </p>
                  <Input type="number" defaultValue="7" className="w-24" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Promotional Codes</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <code className="text-sm font-mono bg-white px-2 py-1 rounded">LAUNCH50</code>
                      <span className="ml-2 text-sm text-gray-500">50% off first 3 months</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">23 used</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <code className="text-sm font-mono bg-white px-2 py-1 rounded">PARTNER20</code>
                      <span className="ml-2 text-sm text-gray-500">20% off forever</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">8 used</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-3">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promo Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Plan: {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Update plan details and pricing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Plan Name</label>
                <Input defaultValue={selectedPlan?.name} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue={selectedPlan?.status}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="legacy">Legacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                defaultValue={selectedPlan?.description}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Monthly Price</label>
                <Input
                  type="number"
                  defaultValue={selectedPlan?.price.monthly}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Yearly Price</label>
                <Input
                  type="number"
                  defaultValue={selectedPlan?.price.yearly}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch defaultChecked={selectedPlan?.isPopular} />
              <label className="text-sm font-medium">Mark as Popular</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}