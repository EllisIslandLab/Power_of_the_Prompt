import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * Check if an email has free tokens available
 * Returns token status for UI display
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address'
      }, { status: 400 });
    }

    const supabase = getSupabase(true);

    // Check user's token status
    const { data: user } = await (supabase as any)
      .from('users')
      .select('free_tokens_claimed, free_tokens_used, free_tokens_claimed_at, free_tokens_used_at')
      .eq('email', email)
      .single();

    // If user doesn't exist, they have tokens available (after verification)
    if (!user) {
      return NextResponse.json({
        success: true,
        status: 'available',
        message: 'Free AI tokens available after email verification',
        claimed: false,
        used: false
      });
    }

    // Check if they've claimed but not used (tokens available)
    if (user.free_tokens_claimed && !user.free_tokens_used) {
      return NextResponse.json({
        success: true,
        status: 'available',
        message: 'Free AI tokens ready to use!',
        claimed: true,
        used: false,
        claimedAt: user.free_tokens_claimed_at
      });
    }

    // Check if they've used their tokens
    if (user.free_tokens_used) {
      // Get their generated project
      const { data: project } = await (supabase as any)
        .from('demo_projects')
        .select('id, business_name, created_at')
        .eq('user_email', email)
        .eq('was_free_generation', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return NextResponse.json({
        success: true,
        status: 'used',
        message: 'Free tokens already used',
        claimed: true,
        used: true,
        usedAt: user.free_tokens_used_at,
        projectId: project?.id,
        projectName: project?.business_name
      });
    }

    // Claimed but something went wrong (edge case)
    return NextResponse.json({
      success: true,
      status: 'claimed',
      message: 'Tokens claimed but not yet used',
      claimed: user.free_tokens_claimed,
      used: user.free_tokens_used
    });

  } catch (error) {
    console.error('Token status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check token status'
    }, { status: 500 });
  }
}
