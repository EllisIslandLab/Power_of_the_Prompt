import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

interface Round1Data {
  email: string;
  businessName: string;
  businessDescription?: string;
  targetAudience?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface Round2Data {
  categoryId: string;
  subcategoryId: string;
  customCategory?: string;
}

interface Round3Data {
  contentSource: 'upload' | 'ai_placeholder' | 'skip';
  files?: File[];
  additionalNotes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { round1, round2, round3 } = body as {
      round1: Round1Data;
      round2: Round2Data;
      round3: Round3Data;
    };

    // Validation
    if (!round1?.email || !round1?.businessName) {
      return NextResponse.json(
        { success: false, error: 'Email and business name are required' },
        { status: 400 }
      );
    }

    if (!round2?.categoryId || !round2?.subcategoryId) {
      return NextResponse.json(
        { success: false, error: 'Category and subcategory are required' },
        { status: 400 }
      );
    }

    if (!round3?.contentSource) {
      return NextResponse.json(
        { success: false, error: 'Content source is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase(true); // Use service role for server-side

    // Step 1: Create or get user
    let { data: user, error: userQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', round1.email)
      .maybeSingle() as any;

    if (userQueryError) {
      console.error('Error querying user:', userQueryError);
      return NextResponse.json(
        { success: false, error: 'Failed to query user' },
        { status: 500 }
      );
    }

    // Create user if doesn't exist
    if (!user) {
      console.log('Creating new user:', round1.email);
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ email: round1.email })
        .select()
        .single() as any;

      if (insertError) {
        console.error('Error creating user:', insertError);

        // Try to get user again (race condition)
        const { data: retryUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', round1.email)
          .single() as any;

        user = retryUser;
      } else {
        user = newUser;
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create or retrieve user' },
        { status: 500 }
      );
    }

    // Step 2: Create demo_projects record
    const projectData = {
      user_email: round1.email,
      user_id: user.id,
      business_name: round1.businessName,
      status: 'draft',
      metadata: {
        round1,
        round2,
        round3,
        createdAt: new Date().toISOString(),
      },
      // Add category references
      category_id: round2.categoryId,
      subcategory_id: round2.subcategoryId,
      custom_category: round2.customCategory || null,
    };

    const { data: project, error: projectError } = await supabase
      .from('demo_projects' as any)
      .insert(projectData as any)
      .select()
      .single() as any;

    if (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json(
        { success: false, error: 'Failed to create project' },
        { status: 500 }
      );
    }

    // Step 3: Check if email verification is needed
    const needsVerification = !user.free_tokens_claimed;

    console.log('Project created:', {
      projectId: project.id,
      email: round1.email,
      needsVerification,
    });

    // Step 4: Send verification email if needed
    if (needsVerification) {
      try {
        const verifyResponse = await fetch(`${req.nextUrl.origin}/api/ai/send-verification-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: round1.email }),
        });

        if (!verifyResponse.ok) {
          console.error('Failed to send verification email');
          // Don't fail the whole request - verification can be retried
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail the whole request
      }
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      needsVerification,
      email: round1.email,
      message: needsVerification
        ? 'Please check your email to verify and continue'
        : 'Project saved successfully',
    });
  } catch (error) {
    console.error('Error in save-rounds endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
