import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = getSupabase(true); // Use service role

    console.log('🚀 Adding category columns to demo_projects...');

    // Add category_id column
    const { error: error1 } = await (supabase.rpc as any)('exec_sql', {
      sql: `ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES website_categories(id);`
    });

    if (error1) {
      console.error('Error adding category_id:', error1);
      // Continue anyway - column might already exist
    }

    // Add subcategory_id column
    const { error: error2 } = await (supabase.rpc as any)('exec_sql', {
      sql: `ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES website_subcategories(id);`
    });

    if (error2) {
      console.error('Error adding subcategory_id:', error2);
    }

    // Add custom_category column
    const { error: error3 } = await (supabase.rpc as any)('exec_sql', {
      sql: `ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS custom_category text;`
    });

    if (error3) {
      console.error('Error adding custom_category:', error3);
    }

    // Add indexes
    const { error: error4 } = await (supabase.rpc as any)('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_demo_projects_category_id ON demo_projects(category_id);
        CREATE INDEX IF NOT EXISTS idx_demo_projects_subcategory_id ON demo_projects(subcategory_id);
      `
    });

    if (error4) {
      console.error('Error adding indexes:', error4);
    }

    console.log('✅ Category columns added successfully!');

    return NextResponse.json({
      success: true,
      message: 'Category columns added to demo_projects table',
      details: {
        category_id: error1 ? 'error' : 'added',
        subcategory_id: error2 ? 'error' : 'added',
        custom_category: error3 ? 'error' : 'added',
        indexes: error4 ? 'error' : 'added'
      }
    });
  } catch (error) {
    console.error('Error in add-category-columns:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add columns',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
