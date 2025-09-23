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
import { Card, CardContent } from '@/components/ui/card';
import { Check, Lock, Sparkles, X } from 'lucide-react';
import { LicenseType, DEFAULT_LIMITS } from '@/lib/types/license';

interface FeatureLockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentLicense: LicenseType;
  requiredLicense: LicenseType;
  description?: string;
  benefits?: string[];
}

const LICENSE_DISPLAY_NAMES: Record<LicenseType, string> = {
  STARTER: 'Starter',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
};

const LICENSE_PRICES: Record<LicenseType, string> = {
  STARTER: '$49/mo',
  PROFESSIONAL: '$199/mo',
  ENTERPRISE: 'Contact Sales',
};

export function FeatureLockedModal({
  open,
  onOpenChange,
  feature,
  currentLicense,
  requiredLicense,
  description,
  benefits,
}: FeatureLockedModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/pricing');
    onOpenChange(false);
  };

  const getUpgradeOptions = (): LicenseType[] => {
    const licenses: LicenseType[] = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
    const currentIndex = licenses.indexOf(currentLicense);
    const requiredIndex = licenses.indexOf(requiredLicense);
    return licenses.slice(requiredIndex, licenses.length);
  };

  const upgradeOptions = getUpgradeOptions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Feature Restricted: {feature}
          </DialogTitle>
          <DialogDescription>
            {description ||
              `This feature requires a ${LICENSE_DISPLAY_NAMES[requiredLicense]} plan or higher to access.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Plan */}
          <div className="rounded-lg border border-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your current plan</p>
                <p className="font-semibold">{LICENSE_DISPLAY_NAMES[currentLicense]} Plan</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>

          {/* Available Upgrade Options */}
          <div className="space-y-3">
            <p className="font-medium">Available upgrade options:</p>
            {upgradeOptions.map((license) => {
              const limits = DEFAULT_LIMITS[license];
              return (
                <Card key={license} className="relative overflow-hidden">
                  {license === requiredLicense && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs rounded-bl-lg">
                      Recommended
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <p className="font-semibold">{LICENSE_DISPLAY_NAMES[license]} Plan</p>
                        </div>
                        <p className="text-2xl font-bold">{LICENSE_PRICES[license]}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-3 w-3 text-green-500" />
                            <span>
                              {limits.maxUsers === null ? 'Unlimited' : limits.maxUsers} users
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-3 w-3 text-green-500" />
                            <span>
                              {limits.maxStorageMb === null
                                ? 'Unlimited'
                                : `${(limits.maxStorageMb / 1024).toFixed(0)} GB`}{' '}
                              storage
                            </span>
                          </div>
                          {license === 'PROFESSIONAL' && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Check className="h-3 w-3 text-green-500" />
                                <span>Custom domains</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Check className="h-3 w-3 text-green-500" />
                                <span>Advanced reporting</span>
                              </div>
                            </>
                          )}
                          {license === 'ENTERPRISE' && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Check className="h-3 w-3 text-green-500" />
                                <span>SSO & SAML</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Check className="h-3 w-3 text-green-500" />
                                <span>White-labeling</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Check className="h-3 w-3 text-green-500" />
                                <span>Priority support</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Benefits of upgrading */}
          {benefits && benefits.length > 0 && (
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="font-medium text-sm">By upgrading you'll also get:</p>
              <ul className="space-y-1">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-3 w-3 text-green-500 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade}>
            <Sparkles className="h-4 w-4 mr-2" />
            View All Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}