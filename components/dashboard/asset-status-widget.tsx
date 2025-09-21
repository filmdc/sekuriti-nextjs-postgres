'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowRight, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface AssetStatusWidgetProps {
  totalAssets: number;
  criticalAssets: number;
  mustContactAssets: number;
  recentAssets: Array<{
    id: number;
    name: string;
    type: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'inactive' | 'maintenance';
  }>;
}

const criticalityConfig = {
  critical: { color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50' },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  low: { color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-50' }
};

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  inactive: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  maintenance: { icon: Shield, color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
};

export function AssetStatusWidget({
  totalAssets,
  criticalAssets,
  mustContactAssets,
  recentAssets
}: AssetStatusWidgetProps) {
  const protectedPercentage = totalAssets > 0 ? Math.round((totalAssets - criticalAssets) / totalAssets * 100) : 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Asset Protection
          </CardTitle>
          <Badge variant="outline">
            {totalAssets} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Protection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Protection Status</span>
            <span className="text-sm font-bold text-green-600">{protectedPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${protectedPercentage}%` }}
            />
          </div>
        </div>

        {/* Asset Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-orange-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Critical</span>
              <span className="text-lg font-bold text-orange-600">
                {criticalAssets}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Must Contact</span>
              <span className="text-lg font-bold text-blue-600">
                {mustContactAssets}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Assets */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Assets</h4>
          {recentAssets.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-blue-600 mb-2">
                <Package className="h-8 w-8 mx-auto opacity-50" />
              </div>
              <p className="text-sm text-gray-500">No assets registered</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentAssets.slice(0, 3).map((asset) => {
                const StatusIcon = statusConfig[asset.status].icon;
                return (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.id}`}
                    className="block p-2 rounded hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`w-2 h-2 rounded-full ${criticalityConfig[asset.criticality].color}`} />
                        <span className="text-sm font-medium truncate">{asset.name}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <StatusIcon className={`h-3 w-3 ${statusConfig[asset.status].color}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 capitalize">{asset.type}</span>
                      <Badge variant="outline" className={`text-xs ${statusConfig[asset.status].color}`}>
                        {asset.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button asChild size="sm" className="flex-1">
            <Link href="/assets/new">
              <Package className="h-4 w-4 mr-1" />
              Add Asset
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/assets">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}