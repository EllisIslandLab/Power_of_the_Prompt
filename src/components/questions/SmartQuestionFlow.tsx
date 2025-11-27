'use client';

import { useState, useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { coreQuestions } from '@/lib/ai/prompts/questionGeneration';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle, Check, Loader } from 'lucide-react';

interface SmartQuestionFlowProps {
  onAnswersChange: (answers: Record<string, string>) => void;
  onEmailChange: (email: string) => void;
}

export function SmartQuestionFlow({
  onAnswersChange,
  onEmailChange
}: SmartQuestionFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResendAt, setCanResendAt] = useState<number>(0);
  const [verificationCode, setVerificationCode] = useState('');

  function handleAnswer(questionId: string, answer: string) {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    onAnswersChange(newAnswers);

    if (questionId === 'email') {
      onEmailChange(answer);
    }
  }

  async function handleNext() {
    const currentQuestion = coreQuestions[currentStep];
    setError(null);

    // If on email question, send verification code
    if (currentQuestion.id === 'email') {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ai/send-verification-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: answers.email })
        });

        const data = await response.json();

        if (data.success) {
          setEmailSent(true);
          // Set cooldown: can't resend for 30 seconds
          setCanResendAt(Date.now() + 30000);
          setCurrentStep(currentStep + 1);
        } else {
          setError(data.error || 'Failed to send verification email');
        }
      } catch (err) {
        setError('Failed to send verification email');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Normal advancement for other questions
    if (currentStep < coreQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  // Handle verification code separately (not tied to Next button)
  async function handleVerifyCode() {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: answers.email,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (data.success) {
        setEmailVerified(true);
        setError(null);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify code');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleResendCode() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: answers.email })
      });

      const data = await response.json();

      if (data.success) {
        setCanResendAt(Date.now() + 30000);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Failed to resend code');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canAdvance()) {
      e.preventDefault();
      handleNext();
    }
  }

  function canAdvance(): boolean {
    const currentQuestion = coreQuestions[currentStep];
    const answer = answers[currentQuestion.id];

    // Require meaningful input (at least 3 characters for text, valid email for email)
    if (currentQuestion.type === 'email') {
      return !!(answer && answer.includes('@') && answer.includes('.'));
    }

    // Optional fields can be skipped
    if (!currentQuestion.required) {
      return true;
    }

    return !!(answer && answer.trim().length >= 3);
  }

  const currentQuestion = coreQuestions[currentStep];

  // Expose emailVerified state to parent
  useEffect(() => {
    if (emailVerified) {
      onAnswersChange({ ...answers, emailVerified: 'true' });
    }
  }, [emailVerified]);

  return (
    <div className="space-y-6">
      {/* Persistent Verification Code Input (shows after email sent) */}
      {emailSent && !emailVerified && (
        <div className="p-4 bg-primary/5 dark:bg-primary/10 border-2 border-primary/30 dark:border-primary/20 rounded-lg sticky top-4 z-10">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-xl">🎁</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground dark:text-slate-100 mb-2">
                Verification code sent to {answers.email}
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="flex-1 px-3 py-2 border border-border dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground dark:text-slate-400 mb-2">
                Code expires in 10 minutes. Continue answering questions below while you wait!
              </p>
              <button
                onClick={handleResendCode}
                disabled={isLoading || Date.now() < canResendAt}
                className="text-xs font-medium text-primary dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {Date.now() < canResendAt
                  ? `Resend in ${Math.ceil((canResendAt - Date.now()) / 1000)}s`
                  : 'Resend code'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Only show current question */}
      <div onKeyPress={handleKeyPress}>
        <QuestionCard
          key={currentQuestion.id}
          {...currentQuestion}
          isActive={true}
          isCompleted={false}
          answer={answers[currentQuestion.id] || ''}
          onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
          canShow={true}
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {emailVerified && (
        <div className="p-4 bg-accent/10 dark:bg-accent/20 border-2 border-accent rounded-lg flex items-center gap-3">
          <div className="flex-shrink-0 text-2xl">⚡</div>
          <div>
            <p className="text-sm font-semibold text-foreground dark:text-slate-100">
              Verified! Your free AI tokens are activated
            </p>
            <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
              Answer all questions below, then click "Generate My Preview"
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0 || isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Hide Next button on last question - user should click Generate instead */}
        {currentStep < coreQuestions.length - 1 && (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance() || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                {currentQuestion.id === 'email' ? 'Sending...' : 'Loading...'}
              </>
            ) : (
              <>
                {currentQuestion.id === 'email' ? 'Send Code' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {coreQuestions.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index < currentStep ? 'w-8 bg-primary dark:bg-blue-400' :
              index === currentStep ? 'w-12 bg-primary dark:bg-blue-500' :
              'w-2 bg-border dark:bg-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Step counter */}
      <div className="text-center text-sm text-muted-foreground dark:text-slate-400">
        Step {currentStep + 1} of {coreQuestions.length}
      </div>
    </div>
  );
}
