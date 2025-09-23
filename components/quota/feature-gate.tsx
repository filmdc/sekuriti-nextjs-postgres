'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles } from 'lucide-react';
import { LicenseType, FEATURE_MATRIX } from '@/lib/types/license';

interface FeatureGateProps {
  feature: string;
  licenseType?: LicenseType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradeModal?: boolean;
  upgradeMessage?: string;
}

export function FeatureGate({
  feature,
  licenseType = 'STARTER',
  children,
  fallback,
  showUpgradeModal = true,
  upgradeMessage,
}: FeatureGateProps) {
  const router = useRouter();
  const [showModal, setShowModal] = React.useState(false);

  const requiredLicenses = FEATURE_MATRIX[feature] || ['ENTERPRISE'];
  const isEnabled = requiredLicenses.includes(licenseType);

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  if (isEnabled) {
    return <>{children}</>;
  }

  // If fallback is provided, render it instead of blocking
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state
  const lockedContent = (
    <div
      className="relative opacity-50 pointer-events-none select-none"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (showUpgradeModal) {
          setShowModal(true);
        }
      }}
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="bg-background border rounded-lg p-4 shadow-lg flex flex-col items-center gap-2">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">Feature Locked</p>
          <Badge variant="secondary" className="text-xs">
            Requires {requiredLicenses[0]} Plan
          </Badge>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <>
      {lockedContent}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              {upgradeMessage ||
                `This feature requires a ${requiredLicenses[0]} plan or higher. Upgrade now to unlock advanced capabilities.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="font-medium">{feature}</p>
              <p className="text-sm text-muted-foreground">
                Available in: {requiredLicenses.join(', ')} plans
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade}>
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook to check feature availability
export function useFeatureGate(feature: string, licenseType: LicenseType = 'STARTER'): boolean {
  const requiredLicenses = FEATURE_MATRIX[feature] || ['ENTERPRISE'];
  return requiredLicenses.includes(licenseType);
}