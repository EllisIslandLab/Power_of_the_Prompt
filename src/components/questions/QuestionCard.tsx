'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  id: string;
  question: string;
  placeholder: string;
  examples?: string[];
  helpText?: string;
  type?: 'text' | 'email';
  isActive: boolean;
  isCompleted: boolean;
  canShow: boolean;
  answer: string;
  onAnswer: (answer: string) => void;
}

export function QuestionCard({
  question,
  placeholder,
  examples,
  helpText,
  type = 'text',
  isActive,
  isCompleted,
  canShow,
  answer,
  onAnswer
}: QuestionCardProps) {
  const [showExamples, setShowExamples] = useState(false);

  if (!canShow) return null;

  return (
    <div
      className={`transition-all duration-300 ${
        isActive ? 'scale-100 opacity-100' :
        isCompleted ? 'scale-95 opacity-60' :
        'scale-95 opacity-40'
      }`}
    >
      <div className={cn(
        'p-6 rounded-lg border-2 transition-colors border-primary bg-card dark:bg-slate-900 dark:border-primary/60'
      )}>
        {/* Question */}
        <label className="block text-lg font-semibold text-foreground dark:text-slate-100 mb-3">
          {question}
        </label>

        {/* Help Text */}
        {helpText && (
          <p className="text-sm text-muted-foreground dark:text-slate-400 mb-3">{helpText}</p>
        )}

        {/* Input */}
        <div>
          <Input
            type={type}
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="border-2 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
          />

          {/* Examples */}
          {examples && examples.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="text-sm text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300"
              >
                {showExamples ? 'Hide' : 'Show'} examples
              </button>

              {showExamples && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {examples.map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onAnswer(example)}
                      className="px-3 py-1 bg-card dark:bg-slate-800 border border-border dark:border-slate-600 rounded-full text-sm hover:bg-muted dark:hover:bg-slate-700 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
