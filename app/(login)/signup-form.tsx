'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CircleIcon, ChevronRight, ChevronLeft, Building2, User } from 'lucide-react';
import { signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { EnhancedSubmitButton } from '@/components/ui/enhanced-submit-button';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useFormFeedback } from '@/components/feedback/feedback-provider';

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Non-Profit',
  'Energy',
  'Transportation',
  'Media & Entertainment',
  'Real Estate',
  'Legal',
  'Other'
];

const COMPANY_SIZES = [
  { value: 'startup', label: '1-10 employees' },
  { value: 'small', label: '11-50 employees' },
  { value: 'medium', label: '51-200 employees' },
  { value: 'large', label: '201-500 employees' },
  { value: 'enterprise', label: '500+ employees' }
];

export function SignUpForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUp,
    { error: '' }
  );

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    title: '',
    organizationName: '',
    industry: '',
    size: '',
    phone: '',
    website: ''
  });

  const formFeedback = useFormFeedback('auth-signup');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate step 1 fields
      if (formData.email && formData.password && formData.name) {
        setStep(2);
      }
    }
  };

  const handlePreviousStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <div className="mt-4 flex justify-center space-x-2">
          <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`} />
          <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`} />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />

          {/* Pass all form data as hidden inputs when submitting */}
          {step === 2 && (
            <>
              <input type="hidden" name="email" value={formData.email} />
              <input type="hidden" name="password" value={formData.password} />
              <input type="hidden" name="name" value={formData.name} />
              <input type="hidden" name="title" value={formData.title} />
            </>
          )}

          {step === 1 ? (
            <>
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Personal Information</h3>
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      maxLength={50}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      minLength={8}
                      maxLength={100}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your password (min 8 characters)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Your Name
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      maxLength={100}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Your Role/Title (Optional)
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      autoComplete="organization-title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      maxLength={100}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="e.g., Security Manager, IT Director"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!formData.email || !formData.password || !formData.name}
                className="w-full rounded-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
              >
                Next: Organization Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium">Organization Details</h3>
                </div>

                <div>
                  <Label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      required
                      maxLength={100}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your organization name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry
                  </Label>
                  <div className="mt-1">
                    <Select
                      name="industry"
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange('industry', value)}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="size" className="block text-sm font-medium text-gray-700">
                    Company Size
                  </Label>
                  <div className="mt-1">
                    <Select
                      name="size"
                      value={formData.size}
                      onValueChange={(value) => handleInputChange('size', value)}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone (Optional)
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      maxLength={50}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="e.g., +1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website (Optional)
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      autoComplete="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      maxLength={255}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="e.g., https://example.com"
                    />
                  </div>
                </div>
              </div>

              {state?.error && (
                <StatusIndicator
                  status="error"
                  message={state.error}
                  variant="default"
                  size="sm"
                />
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  variant="outline"
                  className="w-full rounded-full"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <EnhancedSubmitButton
                  formId="auth-signup"
                  disabled={!formData.organizationName || !formData.industry || !formData.size}
                  className="w-full rounded-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                  pendingText="Creating account..."
                  successText="Account created!"
                >
                  Create Account
                </EnhancedSubmitButton>
              </div>
            </>
          )}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`/sign-in${redirect ? `?redirect=${redirect}` : ''}${priceId ? `&priceId=${priceId}` : ''}`}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Sign in to existing account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}