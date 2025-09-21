'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2, Printer } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface CertificateCardProps {
  certificateUrl: string;
  userName: string;
  exerciseTitle: string;
  completedAt: string;
  score: number;
}

export function CertificateCard({
  certificateUrl,
  userName,
  exerciseTitle,
  completedAt,
  score
}: CertificateCardProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(certificateUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `certificate-${exerciseTitle.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download the certificate. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I completed "${exerciseTitle}"!`,
          text: `I scored ${score}% on the ${exerciseTitle} exercise on Sekuriti.io`,
          url: window.location.href
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'The certificate link has been copied to your clipboard.'
      });
    }
  };

  const handlePrint = () => {
    window.open(certificateUrl, '_blank')?.print();
  };

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-600" />
          Certificate of Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-6 bg-white rounded-lg border-2 border-yellow-100">
          <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Certificate of Achievement</h3>
          <p className="text-lg mb-4">This is to certify that</p>
          <p className="text-2xl font-bold text-primary mb-4">{userName}</p>
          <p className="text-lg mb-2">has successfully completed</p>
          <p className="text-xl font-semibold mb-4">"{exerciseTitle}"</p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Score: {score}%</span>
            <span>•</span>
            <span>{new Date(completedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}