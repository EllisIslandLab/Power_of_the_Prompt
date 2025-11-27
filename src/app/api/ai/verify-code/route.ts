import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { RateLimiterService } from '@/lib/rate-limiter';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({
        success: false,
        error: 'Email and code are required'
      }, { status: 400 });
    }

    // Rate limiting: 5 attempts per email per 10 seconds (brute force protection)
    const rateLimiter = RateLimiterService.getInstance();
    const rateLimitResult = await rateLimiter.checkLimit(
      'verify-code',
      email,
      { tier: 'strict' } // 5 requests per 10 seconds
    );

    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Too many verification attempts. Please try again in a few minutes.'
      }, { status: 429 });
    }

    const supabase = getSupabase(true);

    // Check verification code from Redis
    const redisKey = `verification:${email}`;
    let storedCode: string | null = null;

    try {
      storedCode = await redis.get<string>(redisKey);
      console.log('Redis lookup:', { redisKey, storedCode, inputCode: code, match: storedCode === code });
    } catch (redisError) {
      console.error('Redis error:', redisError);
      return NextResponse.json({
        success: false,
        error: 'Failed to verify code'
      }, { status: 500 });
    }

    if (!storedCode) {
      console.log('No code found in Redis for:', email);
      return NextResponse.json({
        success: false,
        error: 'Verification code has expired or does not exist'
      }, { status: 400 });
    }

    // Ensure both are strings and trim whitespace
    const storedCodeStr = String(storedCode).trim();
    const inputCodeStr = String(code).trim();

    if (storedCodeStr !== inputCodeStr) {
      console.log('Code mismatch:', { stored: storedCodeStr, input: inputCodeStr });
      return NextResponse.json({
        success: false,
        error: 'Invalid verification code'
      }, { status: 400 });
    }

    // Delete the code from Redis (one-time use)
    await redis.del(redisKey);
    console.log(`Verification code used and deleted for ${email}`);

    // Claim free tokens for this email
    // First, try to get existing user (may not exist yet)
    let { data: user, error: userError } = await (supabase as any)
      .from('users')
      .select('id, email, free_tokens_claimed, free_tokens_used')
      .eq('email', email)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

    console.log('User lookup:', { user, userError });

    if (!user) {
      // Create new user with claimed tokens
      console.log('Creating new user with claimed tokens:', email);
      const { data: newUser, error: insertError } = await (supabase as any)
        .from('users')
        .insert({
          email,
          free_tokens_claimed: true,
          free_tokens_claimed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        // User might have been created by another request, try to get them again
        const { data: retryUser } = await (supabase as any)
          .from('users')
          .select('id, email, free_tokens_claimed, free_tokens_used')
          .eq('email', email)
          .single();
        user = retryUser;
      } else {
        user = newUser;
      }
    } else if (!user.free_tokens_claimed) {
      // User exists but hasn't claimed tokens yet
      console.log('Updating existing user to claim tokens:', email);
      await (supabase as any)
        .from('users')
        .update({
          free_tokens_claimed: true,
          free_tokens_claimed_at: new Date().toISOString()
        })
        .eq('email', email);

      // Update local user object
      user.free_tokens_claimed = true;
    }

    console.log('Verification complete for:', email, { claimed: user?.free_tokens_claimed, used: user?.free_tokens_used });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      freeTokensAvailable: user ? (user.free_tokens_claimed && !user.free_tokens_used) : true
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Something went wrong'
    }, { status: 500 });
  }
}
