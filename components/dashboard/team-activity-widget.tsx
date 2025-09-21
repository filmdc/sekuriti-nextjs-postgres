'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, ArrowRight, Clock, AlertTriangle, Package, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: number;
  type: 'incident_created' | 'asset_added' | 'runbook_executed' | 'exercise_completed';
  description: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  timestamp: Date;
  metadata?: {
    incidentId?: number;
    severity?: string;
    assetId?: number;
    runbookId?: number;
    exerciseId?: number;
  };
}

interface TeamActivityWidgetProps {
  activities: ActivityItem[];
  activeMembers: number;
  totalMembers: number;
}

const activityConfig = {
  incident_created: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Incident'
  },
  asset_added: {
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Asset'
  },
  runbook_executed: {
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Runbook'
  },
  exercise_completed: {
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Training'
  }
};

export function TeamActivityWidget({ activities, activeMembers, totalMembers }: TeamActivityWidgetProps) {
  const activityPercentage = totalMembers > 0 ? Math.round(activeMembers / totalMembers * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Team Activity
          </CardTitle>
          <Badge variant="outline">
            {activeMembers}/{totalMembers} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Engagement */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Team Engagement</span>
            <span className="text-sm font-bold text-purple-600">{activityPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${activityPercentage}%` }}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
          {activities.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-purple-600 mb-2">
                <Users className="h-8 w-8 mx-auto opacity-50" />
              </div>
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {activities.slice(0, 4).map((activity) => {
                const config = activityConfig[activity.type];
                const ActivityIcon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-full ${config.bgColor} flex-shrink-0`}>
                      <ActivityIcon className={`h-3 w-3 ${config.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {activity.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {activity.user.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button asChild size="sm" className="flex-1">
            <Link href="/organization/team">
              <Users className="h-4 w-4 mr-1" />
              Manage Team
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