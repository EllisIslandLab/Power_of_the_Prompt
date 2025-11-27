/**
 * Smart question generation for efficient data collection
 */

export interface SmartQuestion {
  id: string;
  question: string;
  placeholder: string;
  examples?: string[];
  helpText?: string;
  type?: 'text' | 'email';
  required: boolean;
}

/**
 * Core questions optimized for token efficiency
 * Email first, then business questions
 * Verification code is handled separately (persistent input, not a question)
 */
export const coreQuestions: SmartQuestion[] = [
  {
    id: 'email',
    question: 'Enter your email to get started',
    placeholder: 'your@email.com',
    type: 'email',
    helpText: "We'll send a verification code for free AI customization tokens",
    required: true
  },
  {
    id: 'business_type',
    question: 'What type of business are you building a website for?',
    placeholder: 'e.g., Financial coaching, Dog grooming, Local restaurant',
    examples: ['Financial coaching', 'Personal training', 'Web design agency', 'Coffee shop', 'Yoga studio'],
    helpText: 'Be specific - this helps us generate better content',
    type: 'text',
    required: true
  },
  {
    id: 'target_audience',
    question: 'Who is your ideal customer or client?',
    placeholder: 'e.g., Busy professionals, New parents, Small business owners',
    examples: ['Couples in debt', 'First-time homebuyers', 'Busy executives', 'Health-conscious millennials'],
    helpText: 'The more specific, the better we can tailor your site',
    type: 'text',
    required: true
  },
  {
    id: 'main_service',
    question: "What's your main service or product?",
    placeholder: 'e.g., 12-week coaching program, Custom meal plans',
    examples: ['Debt elimination coaching', 'Personal training packages', 'Web design services', 'Custom cakes'],
    helpText: 'What do people hire you for?',
    type: 'text',
    required: true
  },
  {
    id: 'unique_value',
    question: 'What makes you different from competitors?',
    placeholder: 'e.g., 20 years experience, Results guaranteed, Personal approach',
    examples: ['Results-focused', 'Science-based approach', 'Personalized plans', 'Local family-owned'],
    helpText: 'Why should someone choose you?',
    type: 'text',
    required: true
  }
];

/**
 * Get follow-up questions based on previous answers
 * (Future enhancement for adaptive questioning)
 */
export function getFollowUpQuestions(
  answers: Record<string, string>
): SmartQuestion[] {
  const followUps: SmartQuestion[] = [];

  // Example: If they mentioned pricing in their service, ask about price range
  if (answers.main_service?.toLowerCase().includes('price') ||
      answers.main_service?.toLowerCase().includes('$')) {
    followUps.push({
      id: 'price_range',
      question: 'What price range do you typically offer?',
      placeholder: 'e.g., $500-2000, $50/hour, Custom quotes',
      type: 'text',
      required: false
    });
  }

  return followUps;
}
