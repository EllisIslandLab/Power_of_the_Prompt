'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThreeRoundFlow } from '@/components/questions/ThreeRoundFlow';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

function GetStartedContent() {
  const router = useRouter();
  const [initialRound, setInitialRound] = useState<1 | 2 | 3 | null>(null);
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Get initial round from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roundParam = params.get('round');
    const round = (roundParam && ['1', '2', '3'].includes(roundParam)
      ? parseInt(roundParam) as 1 | 2 | 3
      : 1);
    setInitialRound(round);
    setCurrentRound(round);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/50">
              <Sparkles className="h-10 w-10 text-white" />
            </div>

            {currentRound === 1 && (
              <>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                  First Round
                  <br />
                  <span className="text-blue-400">Basic Business Information</span>
                </h1>
                <p className="text-xl text-slate-300 mb-6">
                  Tell us about your business, then we'll generate a beautiful website using AI.
                </p>
              </>
            )}

            {currentRound === 2 && (
              <>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                  Second Round
                  <br />
                  <span className="text-blue-400">Website Category</span>
                </h1>
                <p className="text-xl text-slate-300 mb-6">
                  What type of website are you building?
                </p>
              </>
            )}

            {currentRound === 3 && (
              <>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                  Final Round
                  <br />
                  <span className="text-blue-400">Content Source</span>
                </h1>
                <p className="text-xl text-slate-300 mb-6">
                  Let's get your content ready and generate your beautiful website!
                </p>
              </>
            )}

            <div className="space-y-3 mb-8">
              <div className="text-left inline-block">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400 text-lg">✓</span>
                    <span className="text-slate-100">No credit card required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-400 text-lg">✓</span>
                    <span className="text-slate-100">1 free AI-enhanced preview generation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Card className="p-8 md:p-12 bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-blue-500/10">
            {isSaving ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-slate-100">
                  Saving your information...
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  This will only take a moment
                </p>
              </div>
            ) : initialRound !== null ? (
              <ThreeRoundFlow
                onComplete={handleThreeRoundsComplete}
                initialRound={initialRound}
                onRoundChange={setCurrentRound}
              />
            ) : (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-slate-100">
                  Loading...
                </p>
              </div>
            )}
          </Card>

          {/* What to Expect */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-semibold text-slate-100 mb-2">
                Round 1: Business Info
              </h3>
              <p className="text-sm text-slate-400">
                Name, contact, colors - the fundamentals
              </p>
            </div>

            <div className="p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-slate-100 mb-2">
                Round 2: Category
              </h3>
              <p className="text-sm text-slate-400">
                What type of business you run
              </p>
            </div>

            <div className="p-6">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="font-semibold text-slate-100 mb-2">
                Round 3: Content
              </h3>
              <p className="text-sm text-slate-400">
                Upload files or let AI create placeholders
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetStartedContent;
