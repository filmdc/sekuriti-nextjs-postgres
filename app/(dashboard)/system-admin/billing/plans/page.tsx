import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, Edit, Trash2, DollarSign, Users, Zap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PlansPage() {
  // Placeholder plan data
  const plans = [
    {
      id: 1,
      name: 'Starter',
      price: '$99',
      interval: 'month',
      features: ['Up to 10 users', '100 assets', 'Basic runbooks', 'Email support'],
      subscribers: 45,
      revenue: '$4,455',
      status: 'active',
      popular: false,
    },
    {
      id: 2,
      name: 'Professional',
      price: '$299',
      interval: 'month',
      features: ['Up to 50 users', '1,000 assets', 'Advanced runbooks', 'Priority support', 'API access'],
      subscribers: 28,
      revenue: '$8,372',
      status: 'active',
      popular: true,
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 'Custom',
      interval: 'custom',
      features: ['Unlimited users', 'Unlimited assets', 'Custom runbooks', 'Dedicated support', 'SSO/SAML', 'Custom integrations'],
      subscribers: 12,
      revenue: '$45,000',
      status: 'active',
      popular: false,
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">
          Manage subscription plans, pricing, and features
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          This page is under development. Plan management functionality will be available soon.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Available for purchase</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">Across all plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$57,827</div>
            <p className="text-xs text-muted-foreground">Recurring revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">Trial to paid</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Configure available subscription tiers and features</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {plan.popular && (
                          <Badge className="bg-blue-100 text-blue-700">Popular</Badge>
                        )}
                        <Badge variant="outline" className="text-green-600">
                          {plan.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-2xl font-bold">{plan.price}</span>
                        {plan.interval !== 'custom' && (
                          <span className="text-muted-foreground">per {plan.interval}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked={plan.status === 'active'} />
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Zap className="h-3 w-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Subscribers
                        </span>
                        <span className="font-medium">{plan.subscribers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Monthly Revenue
                        </span>
                        <span className="font-medium">{plan.revenue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>Feature comparison across all plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead className="text-center">Starter</TableHead>
                <TableHead className="text-center">Professional</TableHead>
                <TableHead className="text-center">Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Users</TableCell>
                <TableCell className="text-center">10</TableCell>
                <TableCell className="text-center">50</TableCell>
                <TableCell className="text-center">Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Assets</TableCell>
                <TableCell className="text-center">100</TableCell>
                <TableCell className="text-center">1,000</TableCell>
                <TableCell className="text-center">Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Runbooks</TableCell>
                <TableCell className="text-center">Basic</TableCell>
                <TableCell className="text-center">Advanced</TableCell>
                <TableCell className="text-center">Custom</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Support</TableCell>
                <TableCell className="text-center">Email</TableCell>
                <TableCell className="text-center">Priority</TableCell>
                <TableCell className="text-center">Dedicated</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}