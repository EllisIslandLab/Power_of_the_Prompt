import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase(true); // Use service role

    console.log('🚀 Starting migration...');

    // Step 1: Create deep_dive_questions table
    console.log('📝 Creating deep_dive_questions table...');
    const { error: createTableError } = await (supabase.rpc as any)('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS deep_dive_questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          question_text TEXT NOT NULL,
          question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'multiselect')),
          placeholder_text TEXT,
          help_text TEXT,
          is_required BOOLEAN DEFAULT true,
          character_limit INTEGER,
          category_id UUID NOT NULL REFERENCES website_categories(id) ON DELETE CASCADE,
          display_order INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_deep_dive_category
          ON deep_dive_questions(category_id);

        CREATE INDEX IF NOT EXISTS idx_deep_dive_active
          ON deep_dive_questions(category_id, is_active, display_order);
      `
    });

    if (createTableError) {
      console.error('❌ Error creating table:', createTableError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create deep_dive_questions table',
        details: createTableError
      }, { status: 500 });
    }

    // Step 2: Update users table
    console.log('📝 Updating users table...');
    const { error: updateUsersError } = await (supabase.rpc as any)('exec_sql', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS total_ai_credits INTEGER DEFAULT 0;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS used_ai_credits INTEGER DEFAULT 0;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS available_ai_credits INTEGER DEFAULT 0;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS has_purchased BOOLEAN DEFAULT false;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_model_tier TEXT DEFAULT 'haiku'
          CHECK (ai_model_tier IN ('haiku', 'sonnet', 'opus'));
        ALTER TABLE users ADD COLUMN IF NOT EXISTS data_retention_expires_at TIMESTAMP;
      `
    });

    if (updateUsersError) {
      console.error('❌ Error updating users:', updateUsersError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update users table',
        details: updateUsersError
      }, { status: 500 });
    }

    // Step 3: Update demo_projects table
    console.log('📝 Updating demo_projects table...');
    const { error: updateProjectsError } = await (supabase.rpc as any)('exec_sql', {
      sql: `
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS ai_model_used TEXT DEFAULT 'haiku'
          CHECK (ai_model_used IN ('haiku', 'sonnet', 'opus'));
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS preview_round_number INTEGER DEFAULT 1;
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS data_expires_at TIMESTAMP;
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS is_data_retained BOOLEAN DEFAULT false;
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS related_stripe_session_id TEXT;
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS deep_dive_round_answers JSONB;
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS all_accumulated_answers JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS preview_generation_started_at TIMESTAMP;
        ALTER TABLE demo_projects ADD COLUMN IF NOT EXISTS preview_generation_completed_at TIMESTAMP;
      `
    });

    if (updateProjectsError) {
      console.error('❌ Error updating demo_projects:', updateProjectsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update demo_projects table',
        details: updateProjectsError
      }, { status: 500 });
    }

    console.log('✅ Migration completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Migration completed! Note: Question data insertion should be done separately.'
    });

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error.message
    }, { status: 500 });
  }
}
