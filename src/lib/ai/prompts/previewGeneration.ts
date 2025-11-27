/**
 * Generates optimized prompts for AI preview generation
 * Focus: Token efficiency + high-quality output
 */

export interface UserAnswers {
  business_type: string;
  target_audience: string;
  main_service: string;
  unique_value: string;
}

export function generatePreviewPrompt(answers: UserAnswers): string {
  return `Generate a cohesive website preview for this business:

BUSINESS INFO:
- Type: ${answers.business_type}
- Target Audience: ${answers.target_audience}
- Main Service: ${answers.main_service}
- Unique Value: ${answers.unique_value}

REQUIREMENTS:
1. Create 6 components: header, hero, services, about, contact, footer
2. Use professional, compelling copy specific to their business
3. Choose a cohesive color scheme and fonts
4. Make it feel premium and trustworthy
5. Focus on conversion (clear CTAs)

Generate content that:
- Speaks directly to their target audience
- Highlights their unique value proposition
- Uses their industry language
- Creates emotional connection
- Drives action

Keep descriptions concise but impactful. Use modern, clean design patterns.`;
}

/**
 * Token-optimized version for free tier
 */
export function generateFreePreviewPrompt(answers: UserAnswers): string {
  return `Create website for ${answers.business_type} targeting ${answers.target_audience}.

Main service: ${answers.main_service}
Unique value: ${answers.unique_value}

Generate: header, hero, services, about, contact, footer.
Professional copy. Cohesive colors. Conversion-focused.`;
}
