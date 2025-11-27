import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RateLimiterService } from '@/lib/rate-limiter';
import { Redis } from '@upstash/redis';

const resend = new Resend(process.env.RESEND_API_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address'
      }, { status: 400 });
    }

    // Rate limiting: 1 email send per IP per hour
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimiter = RateLimiterService.getInstance();
    const rateLimitResult = await rateLimiter.checkLimit(
      'send-verification-email',
      ip,
      { tier: 'custom', requests: 1, window: '1 h' }
    );

    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Too many email requests. Please try again in an hour.'
      }, { status: 429 });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Store verification code in Redis with 10-minute TTL
    // Key format: verification:email:{email}
    const redisKey = `verification:${email}`;
    try {
      await redis.setex(redisKey, 600, verificationCode); // 600 seconds = 10 minutes
      console.log(`Stored verification code in Redis for ${email}`);
    } catch (redisError) {
      console.error('Redis error:', redisError);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate verification code'
      }, { status: 500 });
    }

    // Send verification email
    const { error: emailError } = await resend.emails.send({
      from: 'Web Launch Academy <onboarding@resend.dev>',
      to: email,
      subject: '🎁 Your Free AI Customization Tokens Are Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a1840;">🚀 Your Free AI Website Is Ready</h2>

          <p>Great news! Your AI-generated preview is ready, and you've earned <strong>free AI customization tokens</strong> to make it even better.</p>

          <p>Use this code to unlock your free customization tokens:</p>

          <div style="background-color: #0a1840; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="margin: 0; font-size: 48px; letter-spacing: 8px;">${verificationCode}</h1>
          </div>

          <p style="color: #666; font-size: 14px;">⏱️ <strong>This code expires in 10 minutes.</strong></p>

          <p>Once verified, you'll be able to:</p>
          <ul style="color: #333;">
            <li>Refine any section with AI</li>
            <li>Change colors and fonts</li>
            <li>Rewrite content</li>
            <li>Add or remove sections</li>
          </ul>

          <p>Don't worry if you miss this code—you can request a new one anytime!</p>

          <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Web Launch Academy | AI-Powered Website Generation</p>
        </div>
      `
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json({
        success: false,
        error: 'Failed to send verification email'
      }, { status: 500 });
    }

    console.log(`Verification code sent to ${email}: ${verificationCode}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Something went wrong'
    }, { status: 500 });
  }
}
