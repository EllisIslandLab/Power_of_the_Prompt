import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'categoryId parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase(true); // Use service role for server-side

    const { data: subcategories, error } = await supabase
      .from('website_subcategories' as any)
      .select('id, category_id, name, slug, description, display_order')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order', { ascending: true }) as any;

    if (error) {
      console.error('Error fetching subcategories:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subcategories' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subcategories: subcategories || [],
    });
  } catch (error) {
    console.error('Error in subcategories endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
