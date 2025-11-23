import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Matthew Ellis'
      }
    });

    if (authError) throw authError;

    // Delete any existing user record with this email (to avoid conflicts)
    await supabase
      .from('users' as any)
      .delete()
      .eq('email', email);

    // Create new user record with the auth user ID
    const { error: insertError } = await supabase
      .from('users' as any)
      .insert({
        id: authData.user.id,
        email: email,
        full_name: 'Matthew Ellis',
        email_verified: true,
        role: 'admin',
        tier: 'vip',
        payment_status: 'paid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating user record:', insertError);
      throw new Error(`Failed to create user record: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Auth user created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    });

  } catch (error: any) {
    console.error('Error creating auth user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create auth user' },
      { status: 500 }
    );
  }
}
