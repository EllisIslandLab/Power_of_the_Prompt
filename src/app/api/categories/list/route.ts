import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase(true); // Use service role for server-side

    const { data: categories, error } = await supabase
      .from('website_categories' as any)
      .select('id, name, slug, description, icon, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true }) as any;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: categories || [],
    });
  } catch (error) {
    console.error('Error in categories list endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
