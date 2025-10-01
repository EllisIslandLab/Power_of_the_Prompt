import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const adminEmail = 'hello@weblaunchacademy.com';

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      // Update existing user to admin
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          tier: 'vip',
          updated_at: new Date().toISOString()
        })
        .eq('email', adminEmail);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'User updated to admin role',
        user: { email: adminEmail, role: 'admin' }
      });
    } else {
      // Create new admin user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: adminEmail,
          full_name: 'Matthew Ellis',
          email_verified: true,
          role: 'admin',
          tier: 'vip',
          payment_status: 'paid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        user: newUser
      });
    }
  } catch (error: any) {
    console.error('Error setting up admin user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup admin user' },
      { status: 500 }
    );
  }
}
