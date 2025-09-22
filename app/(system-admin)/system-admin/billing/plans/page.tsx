'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, DollarSign, Users, TrendingUp, Settings } from 'lucide-react'

const mockPlans = [
  {
    id: 1,
    name: 'Starter',
    price: 29,
    interval: 'monthly',
    features: ['Up to 10 users', '100 assets', 'Basic support'],
    status: 'active',
    subscribers: 145,
    revenue: 4205,
  },
  {
    id: 2,
    name: 'Professional',
    price: 99,
    interval: 'monthly',
    features: ['Up to 50 users', '1000 assets', 'Priority support', 'Advanced analytics'],
    status: 'active',
    subscribers: 89,
    revenue: 8811,
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 299,
    interval: 'monthly',
    features: ['Unlimited users', 'Unlimited assets', 'Dedicated support', 'Custom integrations'],
    status: 'active',
    subscribers: 32,
    revenue: 9568,
  },
]

export default function SubscriptionPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground mt-2">
            Manage pricing tiers and subscription features
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$22,584</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">266</div>
            <p className="text-xs text-muted-foreground">+8 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$84.87</div>
            <p className="text-xs text-muted-foreground">+3.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Plans</CardTitle>
              <CardDescription>
                Manage subscription tiers and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>${plan.price}/{plan.interval}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {plan.features.slice(0, 2).map((feature, i) => (
                            <div key={i} className="text-sm text-muted-foreground">
                              {feature}
                            </div>
                          ))}
                          {plan.features.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              +{plan.features.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{plan.subscribers}</TableCell>
                      <TableCell>${plan.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          {plan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Matrix</CardTitle>
              <CardDescription>
                Configure features available for each plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 gap-4 font-medium">
                  <div>Feature</div>
                  <div>Starter</div>
                  <div>Professional</div>
                  <div>Enterprise</div>
                </div>
                {[
                  'Asset Management',
                  'Incident Response',
                  'Runbook Automation',
                  'Team Collaboration',
                  'API Access',
                  'Custom Integrations',
                  'Advanced Analytics',
                  'White-label Options',
                ].map((feature) => (
                  <div key={feature} className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-sm">{feature}</div>
                    <Switch defaultChecked={Math.random() > 0.5} />
                    <Switch defaultChecked={Math.random() > 0.3} />
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules</CardTitle>
              <CardDescription>
                Configure discounts, trials, and pricing logic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Annual Discount (%)</Label>
                  <Input type="number" defaultValue="20" />
                </div>
                <div className="space-y-2">
                  <Label>Trial Period (days)</Label>
                  <Input type="number" defaultValue="14" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Handling</Label>
                  <Select defaultValue="inclusive">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                      <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="prorate" defaultChecked />
                <Label htmlFor="prorate">Enable proration for plan changes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-upgrade" />
                <Label htmlFor="auto-upgrade">Allow automatic plan upgrades</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}