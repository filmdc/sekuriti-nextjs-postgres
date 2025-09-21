'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Bell,
  X
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface CriticalAlert {
  id: number;
  type: 'security_breach' | 'system_failure' | 'compliance_violation' | 'asset_compromise';
  title: string;
  description: string;
  severity: 'critical' | 'high';
  timestamp: Date;
  source: string;
  actionRequired: boolean;
  url?: string;
  autoResolved?: boolean;
}

interface CriticalAlertsWidgetProps {
  alerts: CriticalAlert[];
  totalAlerts: number;
  alertTrend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

const alertTypeConfig = {
  security_breach: {
    icon: Shield,
    label: 'Security Breach',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  system_failure: {
    icon: AlertTriangle,
    label: 'System Failure',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  compliance_violation: {
    icon: Bell,
    label: 'Compliance',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  asset_compromise: {
    icon: Shield,
    label: 'Asset Compromise',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
};

const severityConfig = {
  critical: { color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' }
};

export function CriticalAlertsWidget({
  alerts,
  totalAlerts,
  alertTrend,
  trendPercentage
}: CriticalAlertsWidgetProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
  const criticalCount = visibleAlerts.filter(a => a.severity === 'critical').length;
  const highCount = visibleAlerts.filter(a => a.severity === 'high').length;

  const dismissAlert = (alertId: number) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getTrendIcon = () => {
    switch (alertTrend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (alertTrend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trendPercentage}%
            </span>
            <Badge variant={totalAlerts > 0 ? 'destructive' : 'secondary'}>
              {totalAlerts}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${severityConfig.critical.bgColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Critical</span>
              <span className={`text-lg font-bold ${severityConfig.critical.textColor}`}>
                {criticalCount}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${severityConfig.high.bgColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">High</span>
              <span className={`text-lg font-bold ${severityConfig.high.textColor}`}>
                {highCount}
              </span>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Alerts</h4>
          {visibleAlerts.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-2">
                <Shield className="h-8 w-8 mx-auto opacity-50" />
              </div>
              <p className="text-sm text-gray-500">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {visibleAlerts.slice(0, 4).map((alert) => {
                const config = alertTypeConfig[alert.type];
                const AlertIcon = config.icon;

                return (
                  <Alert key={alert.id} className="p-3 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-1.5 rounded-full ${config.bgColor} flex-shrink-0`}>
                          <AlertIcon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {alert.title}
                            </h5>
                            <Badge
                              variant={alert.severity === 'critical' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <AlertDescription className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {alert.description}
                          </AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {alert.source} • {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                            </span>
                            {alert.actionRequired && (
                              <Badge variant="outline" className="text-xs text-red-600">
                                Action Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {alert.url && (
                          <Button asChild variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Link href={alert.url}>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissAlert(alert.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button asChild size="sm" className="flex-1">
            <Link href="/incidents/new">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Create Incident
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/organization/audit">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}