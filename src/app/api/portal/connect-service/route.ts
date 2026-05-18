import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { service, projectId, credentials } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate service type
    const validServices = ['supabase', 'airtable', 'vercel', 'resend', 'stripe']
    if (!validServices.includes(service)) {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('client_service_credentials')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('service_name', service)
      .eq('project_id', projectId || null)
      .single()

    if (existingConnection) {
      // Update existing connection
      const { error } = await supabase
        .from('client_service_credentials')
        .update({
          metadata: credentials,
          is_valid: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConnection.id)

      if (error) {
        console.error('Failed to update service credentials:', error)
        return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `${service} connection updated successfully`,
        credentialId: existingConnection.id
      })
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from('client_service_credentials')
        .insert({
          user_id: session.user.id,
          project_id: projectId || null,
          service_name: service,
          metadata: credentials,
          is_valid: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to save service credentials:', error)
        return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `${service} connected successfully`,
        credentialId: data.id
      })
    }
  } catch (error: any) {
    console.error('Error connecting service:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const projectId = searchParams.get('projectId')

    if (!service) {
      return NextResponse.json({ error: 'Service name required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete connection
    let query = supabase
      .from('client_service_credentials')
      .delete()
      .eq('user_id', session.user.id)
      .eq('service_name', service)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { error } = await query

    if (error) {
      console.error('Failed to disconnect service:', error)
      return NextResponse.json({ error: 'Failed to disconnect service' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${service} disconnected successfully`
    })
  } catch (error: any) {
    console.error('Error disconnecting service:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
