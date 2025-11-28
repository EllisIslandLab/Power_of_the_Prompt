'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThreeRoundFlow } from '@/components/questions/ThreeRoundFlow';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function GetStartedPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleThreeRoundsComplete(data: any) {
    setIsSaving(true);

    try {
      // Save all three rounds
      const response = await fetch('/api/save-rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        if (result.needsVerification) {
          // User needs to verify email
          alert('Please check your email and verify to continue!');
          // Redirect to verification page or show verification UI
          router.push(`/get-started/verify?projectId=${result.projectId}&email=${data.round1.email}`);
        } else {
          // User already verified - go to deep-dive
          router.push(`/get-started/deep-dive/${result.projectId}`);
        }
      } else {
        alert(result.error || 'Failed to save data');
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error saving rounds:', error);
      alert('Something went wrong. Please try again.');
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary dark:bg-primary rounded-2xl mb-6 shadow-lg">
              <Sparkles className="h-10 w-10 text-primary-foreground dark:text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground dark:text-slate-100">
              Build Your Custom Website
              <br />
              <span className="text-primary dark:text-blue-400">In 3 Simple Rounds</span>
            </h1>

            <p className="text-xl text-muted-foreground dark:text-slate-400 mb-4">
              Provide your real business information and let AI enhance it.
              <br />
              <strong className="text-foreground dark:text-slate-100">
                Your data + AI intelligence = Perfect website
              </strong>
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 dark:bg-accent/20 border border-accent dark:border-accent/50 rounded-full text-sm">
              <span className="text-accent dark:text-yellow-400">✓</span>
              <span className="text-foreground dark:text-slate-100">No credit card required</span>
              <span className="text-muted-foreground dark:text-slate-400">•</span>
              <span className="text-accent dark:text-yellow-400">✓</span>
              <span className="text-foreground dark:text-slate-100">2 free AI refinements</span>
            </div>
          </div>

          {/* Main Content */}
          <Card className="p-8 md:p-12 dark:bg-slate-900 dark:border-slate-700">
            {isSaving ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-medium text-foreground dark:text-slate-100">
                  Saving your information...
                </p>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mt-2">
                  This will only take a moment
                </p>
              </div>
            ) : (
              <ThreeRoundFlow onComplete={handleThreeRoundsComplete} />
            )}
          </Card>

          {/* What to Expect */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-semibold text-foreground dark:text-slate-100 mb-2">
                Round 1: Business Info
              </h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Name, contact, colors - the fundamentals
              </p>
            </div>

            <div className="p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-foreground dark:text-slate-100 mb-2">
                Round 2: Category
              </h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                What type of business you run
              </p>
            </div>

            <div className="p-6">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-semibold text-foreground dark:text-slate-100 mb-2">
                Round 3: Content
              </h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Upload files or let AI create placeholders
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
