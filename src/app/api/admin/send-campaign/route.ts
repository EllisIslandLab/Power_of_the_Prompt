import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: userRecord } = await supabase
      .from('users' as any)
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userRecord || userRecord.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    const { templateId } = await req.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('email_templates' as any)
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Fetch all leads (exclude barnabas.financial.coach.1@gmail.com)
    const { data: leads, error: leadsError } = await supabase
      .from('leads' as any)
      .select('email, name')
      .neq('email', 'barnabas.financial.coach.1@gmail.com')
      .eq('status', 'waitlist');

    if (leadsError) throw leadsError;

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads found to send emails to' },
        { status: 400 }
      );
    }

    // Send emails to each lead
    const results = {
      total: leads.length,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const lead of leads) {
      try {
        // Replace template variables
        const name = lead.name || 'there';
        const subject = template.subject_template.replace(/\{\{name\}\}/g, name);
        const content = template.content_template.replace(/\{\{name\}\}/g, name);

        // Send email via Resend
        await resend.emails.send({
          from: 'Web Launch Academy <noreply@weblaunchacademy.com>',
          to: lead.email,
          subject: subject,
          html: content,
        });

        results.sent++;

        // Update lead's last_engagement
        await supabase
          .from('leads' as any)
          .update({ last_engagement: new Date().toISOString() })
          .eq('email', lead.email);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`Failed to send email to ${lead.email}:`, error);
        results.failed++;
        results.errors.push(`${lead.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
