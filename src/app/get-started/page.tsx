'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SmartQuestionFlow } from '@/components/questions/SmartQuestionFlow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Clock, Zap, Lock } from 'lucide-react';

export default function GetStartedPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tokenStatus, setTokenStatus] = useState<{
    status: 'available' | 'used' | 'claimed' | 'checking';
    message: string;
    projectId?: string;
  } | null>(null);

  async function handleGeneratePreview() {
    if (!userEmail) {
      alert('Please enter your email to continue');
      return;
    }

    // Check if email is verified OR if they already have tokens claimed (returning user)
    const hasVerifiedInSession = answers.emailVerified === 'true';
    const hasTokensClaimed = tokenStatus?.status === 'available';

    if (!hasVerifiedInSession && !hasTokensClaimed) {
      alert('Please verify your email with the code sent to your inbox to unlock free AI tokens');
      return;
    }

    // Check if all required questions are answered
    const requiredFields = ['email', 'business_type', 'target_audience', 'main_service', 'unique_value'];
    const missingFields = requiredFields.filter(field => !answers[field]);

    if (missingFields.length > 0) {
      alert('Please answer all questions before generating your preview');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate free preview
      const response = await fetch('/api/ai/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          answers,
          isFreeGeneration: true
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to preview
        router.push(`/get-started/preview/${data.projectId}`);
      } else {
        if (data.needsUpgrade) {
          // User already used free preview
          alert(data.error);
          router.push('/pricing');
        } else {
          alert(data.error || 'Failed to generate preview');
        }
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Something went wrong. Please try again.');
      setIsGenerating(false);
    }
  }

  const canGenerate = userEmail &&
    answers.business_type &&
    answers.target_audience &&
    answers.main_service &&
    answers.unique_value &&
    (answers.emailVerified === 'true' || tokenStatus?.status === 'available'); // Email verified in session OR has tokens claimed

  // Check token status when email is set (for returning users)
  async function checkTokenStatus(email: string) {
    if (!email || !email.includes('@')) return;

    setTokenStatus({ status: 'checking', message: 'Checking...' });

    try {
      const response = await fetch('/api/ai/check-token-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setTokenStatus({
          status: data.status,
          message: data.message,
          projectId: data.projectId
        });

        // If they already used their tokens, show option to view project
        if (data.status === 'used' && data.projectId) {
          const viewProject = confirm(`${data.message}\n\nWould you like to view your existing project?`);
          if (viewProject) {
            router.push(`/get-started/preview/${data.projectId}`);
          }
        }
      }
    } catch (error) {
      console.error('Token status check failed:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary dark:bg-primary rounded-2xl mb-6 shadow-lg">
            <Sparkles className="h-10 w-10 text-primary-foreground dark:text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground dark:text-slate-100">
            See Your Custom Website
            <br />
            <span className="text-primary dark:text-blue-400">In 60 Seconds</span>
          </h1>

          <p className="text-xl text-muted-foreground dark:text-slate-400 mb-8">
            AI-powered website generation. No templates. No generic designs.
            <br />
            <strong className="text-foreground dark:text-slate-100">100% custom to your business.</strong>
          </p>

          <Card className="p-8 md:p-12 dark:bg-slate-900 dark:border-slate-700">
            {/* Token Status Display */}
            {tokenStatus && tokenStatus.status !== 'checking' && (
              <div className={`mb-6 p-4 rounded-lg border ${
                tokenStatus.status === 'available'
                  ? 'bg-accent/10 dark:bg-accent/20 border-accent dark:border-accent/50'
                  : tokenStatus.status === 'used'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {tokenStatus.status === 'available' ? '⚡' :
                     tokenStatus.status === 'used' ? '⚠️' : 'ℹ️'}
                  </span>
                  <p className={`text-sm font-medium ${
                    tokenStatus.status === 'available'
                      ? 'text-foreground dark:text-slate-100'
                      : tokenStatus.status === 'used'
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {tokenStatus.message}
                  </p>
                </div>
              </div>
            )}

            {/* Smart Question Flow */}
            <SmartQuestionFlow
              onAnswersChange={setAnswers}
              onEmailChange={(email) => {
                setUserEmail(email);
                if (email.includes('@')) {
                  checkTokenStatus(email);
                }
              }}
            />

            {/* Generate Button */}
            <Button
              onClick={handleGeneratePreview}
              disabled={isGenerating || !canGenerate}
              className="w-full mt-8 text-lg font-bold py-6 px-8 text-primary-foreground bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Your Website...
                </span>
              ) : (
                'Generate My Preview - FREE'
              )}
            </Button>

            <p className="text-sm text-muted-foreground dark:text-slate-400 mt-4">
              ✓ No credit card required
              <br />
              ✓ See your site in under 60 seconds
              <br />
              ✓ Customize with AI for just $5
            </p>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center dark:bg-slate-900 dark:border-slate-700">
              <Clock className="h-8 w-8 text-primary dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary dark:text-blue-400">60s</div>
              <div className="text-sm text-muted-foreground dark:text-slate-400">Average Generation Time</div>
            </Card>
            <Card className="p-6 text-center dark:bg-slate-900 dark:border-slate-700">
              <Zap className="h-8 w-8 text-primary dark:text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary dark:text-blue-400">AI-Powered</div>
              <div className="text-sm text-muted-foreground dark:text-slate-400">Claude Sonnet 4.5</div>
            </Card>
            <Card className="p-6 text-center dark:bg-slate-900 dark:border-slate-700">
              <Lock className="h-8 w-8 text-accent dark:text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-accent dark:text-yellow-400">Own Forever</div>
              <div className="text-sm text-muted-foreground dark:text-slate-400">Your Code, Your Site</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
