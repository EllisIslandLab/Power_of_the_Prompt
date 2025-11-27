/**
 * Prompts for refining individual components with AI
 */

export interface RefinementRequest {
  componentName: string;
  currentContent: any;
  userRequest: string;
  businessContext: {
    business_type: string;
    target_audience: string;
  };
}

export function generateRefinementPrompt(req: RefinementRequest): string {
  return `Refine the "${req.componentName}" component based on user feedback.

CURRENT COMPONENT:
${JSON.stringify(req.currentContent, null, 2)}

BUSINESS CONTEXT:
- Type: ${req.businessContext.business_type}
- Audience: ${req.businessContext.target_audience}

USER REQUEST:
"${req.userRequest}"

INSTRUCTIONS:
1. Keep the same component structure
2. Apply the user's requested changes
3. Maintain cohesion with the overall design
4. Ensure professional quality
5. Keep conversion focus

Return the updated component in the same JSON format.`;
}

export function generateColorChangePrompt(
  currentTheme: any,
  userRequest: string
): string {
  return `Update the color theme based on this request: "${userRequest}"

CURRENT THEME:
${JSON.stringify(currentTheme, null, 2)}

Provide updated theme colors that:
1. Work well together (proper contrast)
2. Match the requested aesthetic
3. Remain professional
4. Support accessibility

Return in same JSON format.`;
}

export function generateContentRewritePrompt(
  section: string,
  currentContent: string,
  tone: string
): string {
  return `Rewrite this ${section} section in a ${tone} tone:

CURRENT:
"${currentContent}"

Make it:
- More ${tone}
- Compelling and clear
- Specific and actionable
- Professional but engaging

Return just the rewritten text.`;
}
