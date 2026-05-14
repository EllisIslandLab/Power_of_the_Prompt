import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { migrationFile } = await request.json()

    if (!migrationFile) {
      return Response.json({ error: 'Migration file name required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile)
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('Running migration:', migrationFile)

    // Execute SQL via Supabase Management API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    )

    if (!response.ok) {
      // If that doesn't work, try direct execution via pg admin
      const { Pool } = await import('pg')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })

      try {
        await pool.query(sql)
        await pool.end()

        return Response.json({
          success: true,
          message: 'Migration executed successfully via direct connection'
        })
      } catch (pgError: any) {
        await pool.end()
        throw new Error(`PG execution failed: ${pgError.message}`)
      }
    }

    const result = await response.json()

    return Response.json({ success: true, result })
  } catch (error: any) {
    console.error('Migration error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
