'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Incident {
  id: number;
  title: string;
  referenceNumber: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'contained' | 'resolved';
  classification: string;
  createdAt: Date;
}

interface IncidentSummaryWidgetProps {
  incidents: { incident: Incident }[];
  totalOpen: number;
}

const severityConfig = {
  critical: { color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50' },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  low: { color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50' }
};

const statusConfig = {
  open: { label: 'Open', color: 'bg-red-100 text-red-800' },
  contained: { label: 'Contained', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' }
};

export function IncidentSummaryWidget({ incidents, totalOpen }: IncidentSummaryWidgetProps) {
  const criticalIncidents = incidents.filter(i => i.incident.severity === 'critical').length;
  const highIncidents = incidents.filter(i => i.incident.severity === 'high').length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Incidents
          </CardTitle>
          <Badge variant={totalOpen > 0 ? 'destructive' : 'secondary'}>
            {totalOpen} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Severity Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${severityConfig.critical.bgColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Critical</span>
              <span className={`text-lg font-bold ${severityConfig.critical.textColor}`}>
                {criticalIncidents}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${severityConfig.high.bgColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">High</span>
              <span className={`text-lg font-bold ${severityConfig.high.textColor}`}>
                {highIncidents}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
          {incidents.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-2">
                <AlertTriangle className="h-8 w-8 mx-auto opacity-50" />
              </div>
              <p className="text-sm text-gray-500">No active incidents</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {incidents.slice(0, 3).map(({ incident }) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="block p-2 rounded hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full ${severityConfig[incident.severity].color}`} />
                      <span className="text-sm font-medium truncate">{incident.title}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{incident.referenceNumber}</span>
                    <Badge variant="outline" className={`text-xs ${statusConfig[incident.status].color}`}>
                      {statusConfig[incident.status].label}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button asChild size="sm" className="flex-1">
            <Link href="/incidents/new">
              <AlertTriangle className="h-4 w-4 mr-1" />
              New Incident
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/incidents">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}