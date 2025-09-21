'use client';

import { ArrowRight } from 'lucide-react';
import { EnhancedSubmitButton } from '@/components/ui/enhanced-submit-button';

export function SubmitButton() {
  return (
    <EnhancedSubmitButton
      formId="pricing-form"
      variant="outline"
      className="w-full rounded-full"
      pendingText="Setting up..."
      successText="Redirecting..."
      showStatusIndicator={true}
    >
      Get Started
      <ArrowRight className="ml-2 h-4 w-4" />
    </EnhancedSubmitButton>
  );
}
