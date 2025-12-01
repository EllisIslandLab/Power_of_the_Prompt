'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  project: any;
  hasAIPremium: boolean;
  userEmail: string;
}

export function UpgradePrompt({
  project,
  hasAIPremium,
  userEmail
}: UpgradePromptProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  async function handleUpgrade(tier: 'refinements' | 'full_package') {
    setIsUpgrading(true);

    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          userEmail,
          userName: userEmail.split('@')[0],
          projectId: project.id,
          returnState: {
            projectId: project.id,
            action: tier === 'refinements' ? 'customize' : 'download'
          }
        })
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsUpgrading(false);
    }
  }

  if (hasAIPremium) {
    return (
      <Card className="p-6 sticky top-8 dark:bg-slate-900 dark:border-slate-700">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚡</div>
          <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-2">Customize with AI</h2>
          <p className="text-muted-foreground dark:text-slate-400">
            You have AI Premium! Use your credits to refine any element.
          </p>
        </div>

        {/* Show customization options */}
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30">
            <h3 className="font-semibold text-foreground dark:text-slate-100 mb-2">What You Can Do:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-blue-400">•</span>
                <span>Refine any section with AI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-blue-400">•</span>
                <span>Change colors and fonts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-blue-400">•</span>
                <span>Add or remove sections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary dark:text-blue-400">•</span>
                <span>Rewrite content</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="pt-4 border-t border-border dark:border-slate-700">
            <h3 className="font-semibold text-foreground dark:text-slate-100 mb-3">Ready for More?</h3>
            <div className="space-y-2 text-sm">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = '/pricing'}
              >
                📦 Get Full Code Package - $799
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = '/pricing'}
              >
                📚 Architecture Mastery - $190
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6 sticky top-8 border-2 border-accent dark:bg-slate-900 dark:border-slate-700')}>
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🚀</div>
        <h2 className="text-2xl font-bold text-foreground dark:text-slate-100 mb-2">Love What You See?</h2>
        <p className="text-foreground dark:text-slate-300">
          Unlock deep customization with AI for just <strong>$5</strong>
        </p>
      </div>

      {/* What's Included */}
      <div className="bg-muted dark:bg-slate-800 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-foreground dark:text-slate-100 mb-3">With AI Premium ($5):</h3>
        <ul className="space-y-2 text-sm text-muted-foreground dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-primary dark:text-blue-400">✓</span>
            <span><strong>3 AI-powered refinements</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary dark:text-blue-400">✓</span>
            <span>Refine any section instantly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary dark:text-blue-400">✓</span>
            <span>Change design elements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary dark:text-blue-400">✓</span>
            <span>Rewrite content with AI</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary dark:text-blue-400">✓</span>
            <span>Add/remove sections</span>
          </li>
        </ul>
      </div>

      {/* FOMO Trigger */}
      <div className="bg-accent/10 dark:bg-accent/20 border border-accent rounded-lg p-3 mb-6">
        <p className="text-sm text-accent-foreground dark:text-accent">
          ⏱️ <strong>You've invested 2 minutes.</strong>
          <br />
          Don't let this preview go to waste!
        </p>
      </div>

      {/* Pricing Options */}
      <div className="space-y-3">
        {/* Option 1: Refinements */}
        <Button
          onClick={() => handleUpgrade('refinements')}
          disabled={isUpgrading}
          className="w-full bg-primary text-primary-foreground text-lg font-bold py-6 hover:bg-primary-hover disabled:opacity-50"
        >
          {isUpgrading ? 'Processing...' : '⚡ Refine Preview - $10'}
        </Button>
        <p className="text-xs text-center text-muted-foreground dark:text-slate-500 -mt-1">
          2 AI refinement credits • $5 per credit
        </p>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-card dark:bg-slate-900 text-muted-foreground">or get everything</span>
          </div>
        </div>

        {/* Option 2: Full Package */}
        <Button
          onClick={() => handleUpgrade('full_package')}
          disabled={isUpgrading}
          variant="outline"
          className="w-full border-2 border-secondary dark:border-blue-500/50 text-lg font-bold py-6 hover:bg-secondary/10"
        >
          📦 Foundation Course - $799
        </Button>
        <div className="text-xs text-center text-muted-foreground dark:text-slate-500 -mt-1 space-y-1">
          <p>Full code + Textbook + Videos + Architecture Toolkit</p>
          <p className="text-accent dark:text-yellow-400 font-medium">💎 Any credits purchased roll over!</p>
        </div>
      </div>
    </Card>
  );
}
