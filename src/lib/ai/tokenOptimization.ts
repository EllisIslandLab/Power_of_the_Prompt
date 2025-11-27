/**
 * Token optimization utilities for efficient AI usage
 */

/**
 * Estimate token count (rough approximation)
 * 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within token budget
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;

  return text.substring(0, maxChars - 3) + '...';
}

/**
 * Compress user answers for efficient prompting
 */
export function compressAnswers(answers: Record<string, string>): string {
  return Object.entries(answers)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');
}

/**
 * Calculate token budget for free vs paid tiers
 */
export const TOKEN_BUDGETS = {
  FREE_PREVIEW: 2000,      // Just enough for basic generation
  PREMIUM_REFINEMENT: 4000, // More tokens for detailed refinements
  FULL_CUSTOMIZATION: 8000  // Maximum quality for paid users
} as const;

/**
 * Optimize prompt based on tier
 */
export function optimizePrompt(
  basePrompt: string,
  tier: 'free' | 'premium' | 'full'
): string {
  const budget = TOKEN_BUDGETS[
    tier === 'free' ? 'FREE_PREVIEW' :
    tier === 'premium' ? 'PREMIUM_REFINEMENT' :
    'FULL_CUSTOMIZATION'
  ];

  return truncateToTokens(basePrompt, budget);
}

/**
 * Track token usage for analytics
 */
export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_estimate: number; // in USD
}

export function calculateCost(usage: TokenUsage): number {
  // Claude Sonnet 4 pricing (as of Jan 2025)
  const COST_PER_INPUT_TOKEN = 0.000003;  // $3 per million
  const COST_PER_OUTPUT_TOKEN = 0.000015; // $15 per million

  return (
    usage.prompt_tokens * COST_PER_INPUT_TOKEN +
    usage.completion_tokens * COST_PER_OUTPUT_TOKEN
  );
}
