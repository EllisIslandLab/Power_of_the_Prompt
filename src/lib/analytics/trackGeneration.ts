/**
 * Analytics tracking for AI preview generation
 * Helps us learn and improve over time
 */

import { getSupabase } from '@/lib/supabase';

export interface GenerationData {
  projectId: string;
  answers: Record<string, string>;
  generatedData: any;
  wasFree: boolean;
  tokensUsed?: number;
  generationTimeMs?: number;
}

/**
 * Track generation for learning and optimization
 */
export async function trackGeneration(data: GenerationData) {
  try {
    const supabase = getSupabase(true); // Use service role

    // Log to ai_interaction_logs for detailed tracking
    const { error } = await (supabase as any)
      .from('ai_interaction_logs')
      .insert({
        user_email: data.answers.email || 'unknown',
        interaction_type: 'preview_generation',
        prompt_sent: JSON.stringify(data.answers),
        response_received: JSON.stringify(data.generatedData),
        credits_used: data.wasFree ? 0 : 1,
        demo_project_id: data.projectId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to track generation:', error);
      // Don't throw - tracking failures shouldn't break the flow
    }

    // Track metrics for analysis
    await trackMetrics({
      projectId: data.projectId,
      businessType: data.answers.business_type,
      wasFree: data.wasFree,
      tokensUsed: data.tokensUsed,
      generationTimeMs: data.generationTimeMs
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Silently fail - don't break user experience
  }
}

/**
 * Track conversion events
 */
export async function trackConversion(
  projectId: string,
  event: 'viewed_preview' | 'upgraded_to_premium' | 'purchased_code' | 'downloaded'
) {
  try {
    const supabase = getSupabase(true); // Use service role

    await (supabase as any)
      .from('conversion_events')
      .insert({
        project_id: projectId,
        event_type: event,
        timestamp: new Date().toISOString()
      });

  } catch (error) {
    console.error('Conversion tracking error:', error);
  }
}

/**
 * Track AI refinement usage
 */
export async function trackRefinement(data: {
  projectId: string;
  componentName: string;
  userRequest: string;
  creditsUsed: number;
  successful: boolean;
}) {
  try {
    const supabase = getSupabase(true); // Use service role

    await (supabase as any)
      .from('ai_interaction_logs')
      .insert({
        demo_project_id: data.projectId,
        interaction_type: 'component_refinement',
        prompt_sent: JSON.stringify({
          component: data.componentName,
          request: data.userRequest
        }),
        credits_used: data.creditsUsed,
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Refinement tracking error:', error);
  }
}

/**
 * Track performance metrics for optimization
 */
async function trackMetrics(data: {
  projectId: string;
  businessType: string;
  wasFree: boolean;
  tokensUsed?: number;
  generationTimeMs?: number;
}) {
  try {
    const supabase = getSupabase(true); // Use service role

    // Store metrics for later analysis
    await (supabase as any)
      .from('generation_metrics')
      .insert({
        project_id: data.projectId,
        business_type: data.businessType,
        was_free: data.wasFree,
        tokens_used: data.tokensUsed || 0,
        generation_time_ms: data.generationTimeMs || 0,
        created_at: new Date().toISOString()
      });

  } catch (error) {
    // Metrics table might not exist yet - that's OK
    console.log('Metrics tracking skipped:', (error as Error).message);
  }
}

/**
 * Get analytics for a user (for dashboard)
 */
export async function getUserAnalytics(userEmail: string) {
  try {
    const supabase = getSupabase(true); // Use service role

    const { data: projects, error } = await supabase
      .from('demo_projects')
      .select('*')
      .eq('email', userEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: interactions } = await (supabase as any)
      .from('ai_interaction_logs')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    return {
      totalProjects: projects?.length || 0,
      totalInteractions: interactions?.length || 0,
      projects: projects || [],
      recentInteractions: interactions?.slice(0, 10) || []
    };

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
}
