'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedIncidentForm } from '@/components/forms/enhanced-incident-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { AlertTriangle } from 'lucide-react';

interface IncidentFormData {
  title: string;
  description: string;
  classification: string;
  severity: string;
  detectionDetails: string;
  reportedBy: string;
  affectedSystems: string;
  initialResponse: string;
}

const breadcrumbItems = [
  { label: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { label: 'New Incident' }
];

export default function EnhancedNewIncidentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Simulated auto-save function
  const handleAutoSave = async (data: IncidentFormData) => {
    try {
      // In a real app, this would save to a draft endpoint
      const response = await fetch('/api/incidents/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          isDraft: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Auto-save failed');
      }

      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Auto-save error:', error);
      // Don't throw - auto-save failures shouldn't interrupt user workflow
    }
  };

  // Form submission function
  const handleSubmit = async (data: IncidentFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create incident');
      }

      const incident = await response.json();
      return { id: incident.id };
    } catch (error) {
      console.error('Error creating incident:', error);
      return {
        error: error instanceof Error
          ? error.message
          : 'Failed to create incident. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Enhanced Form */}
      <EnhancedIncidentForm
        onSubmit={handleSubmit}
        onAutoSave={handleAutoSave}
        isLoading={isLoading}
        mode="create"
      />
    </div>
  );
}