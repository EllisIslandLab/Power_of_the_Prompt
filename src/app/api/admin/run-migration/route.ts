import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * ONE-TIME migration endpoint
 * Run this once to add free_tokens columns to users table
 * DELETE THIS FILE after running
 */
export async function POST() {
  const supabase = getSupabase(true); // Service role

  try {
    console.log('Adding free_tokens columns to users table...');

    // Add columns one by one (idempotent - won't fail if already exists)
    const migrations = [
      {
        name: 'free_tokens_claimed',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name='users' AND column_name='free_tokens_claimed'
            ) THEN
              ALTER TABLE users ADD COLUMN free_tokens_claimed boolean DEFAULT false;
              RAISE NOTICE 'Added free_tokens_claimed column';
            END IF;
          END $$;
        `
      },
      {
        name: 'free_tokens_used',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name='users' AND column_name='free_tokens_used'
            ) THEN
              ALTER TABLE users ADD COLUMN free_tokens_used boolean DEFAULT false;
              RAISE NOTICE 'Added free_tokens_used column';
            END IF;
          END $$;
        `
      },
      {
        name: 'free_tokens_claimed_at',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name='users' AND column_name='free_tokens_claimed_at'
            ) THEN
              ALTER TABLE users ADD COLUMN free_tokens_claimed_at timestamp;
              RAISE NOTICE 'Added free_tokens_claimed_at column';
            END IF;
          END $$;
        `
      },
      {
        name: 'free_tokens_used_at',
        sql: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name='users' AND column_name='free_tokens_used_at'
            ) THEN
              ALTER TABLE users ADD COLUMN free_tokens_used_at timestamp;
              RAISE NOTICE 'Added free_tokens_used_at column';
            END IF;
          END $$;
        `
      },
      {
        name: 'index',
        sql: `CREATE INDEX IF NOT EXISTS idx_users_free_tokens ON users(email, free_tokens_claimed, free_tokens_used);`
      }
    ];

    const results = [];

    for (const migration of migrations) {
      try {
        console.log(`Running migration: ${migration.name}`);
        const { data, error } = await (supabase as any).rpc('exec_sql', {
          query: migration.sql
        });

        if (error) {
          console.error(`Error in ${migration.name}:`, error);
          results.push({ name: migration.name, success: false, error: error.message });
        } else {
          console.log(`✅ ${migration.name} completed`);
          results.push({ name: migration.name, success: true });
        }
      } catch (err: any) {
        console.error(`Exception in ${migration.name}:`, err);
        results.push({ name: migration.name, success: false, error: err.message });
      }
    }

    // Verify columns exist
    const { data: testUser } = await (supabase as any)
      .from('users')
      .select('email, free_tokens_claimed, free_tokens_used, free_tokens_claimed_at, free_tokens_used_at')
      .limit(1)
      .single();

    console.log('Test query result:', testUser);

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results,
      testQuery: testUser
    });

  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
