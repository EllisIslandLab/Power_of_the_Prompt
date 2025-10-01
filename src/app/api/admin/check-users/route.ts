import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const email = 'hello@weblaunchacademy.com';

    // Check auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    const authUser = authUsers?.users.find(u => u.email === email);

    // Check public.users table
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    return NextResponse.json({
      auth_user: authUser || null,
      public_users: publicUsers || [],
      auth_error: authError?.message || null,
      public_error: publicError?.message || null
    });

  } catch (error: any) {
    console.error('Error checking users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check users' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const email = 'hello@weblaunchacademy.com';

    // Delete from public.users table
    const { error: publicDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('email', email);

    if (publicDeleteError) {
      console.error('Error deleting from public.users:', publicDeleteError);
    }

    // Delete from auth.users table
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users.find(u => u.email === email);

    if (authUser) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(authUser.id);
      if (authDeleteError) {
        console.error('Error deleting from auth.users:', authDeleteError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted from both tables',
      deleted_public: !publicDeleteError,
      deleted_auth: authUser ? true : false
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
