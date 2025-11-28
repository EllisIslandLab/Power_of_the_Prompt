import { getSupabase } from '@/lib/supabase';
import { PreviewFrame } from '@/components/preview/PreviewFrame';
import { UpgradePrompt } from '@/components/preview/UpgradePrompt';
import { redirect } from 'next/navigation';
import { trackConversion } from '@/lib/analytics/trackGeneration';

export default async function PreviewPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  // Await params in Next.js 15
  const { projectId } = await params;

  const supabase = getSupabase(true); // Use service role for server-side

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('demo_projects')
    .select('*')
    .eq('id', projectId)
    .single() as any;

  if (projectError || !project) {
    console.error('Project not found:', projectError);
    redirect('/get-started');
  }

  // Check if user has AI Premium
  const { data: user } = await supabase
    .from('users')
    .select('available_ai_credits')
    .eq('email', project.email)
    .single() as any;

  const hasAIPremium = user && user.available_ai_credits > 0;

  // Track that they viewed the preview
  await trackConversion(project.id, 'viewed_preview');

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground dark:text-slate-100">
            Your Website Preview
          </h1>
          <p className="text-xl text-muted-foreground dark:text-slate-400">
            {project.was_free_generation && !hasAIPremium
              ? 'Love it? Customize every element with AI for just $5'
              : 'Refine and customize with AI'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2">
            <PreviewFrame
              project={project}
              hasAIPremium={hasAIPremium}
            />
          </div>

          {/* Upgrade/Customization Panel */}
          <div className="lg:col-span-1">
            <UpgradePrompt
              project={project}
              hasAIPremium={hasAIPremium}
              userEmail={project.email}
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-card dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-border dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-foreground dark:text-slate-100">What You Can Do Next</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Option 1: Customize with AI */}
              <div className="p-6 border-2 border-primary dark:border-blue-500/30 rounded-xl hover:border-primary dark:hover:border-blue-500/60 transition-colors">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-slate-100">
                  Customize with AI - $5
                </h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mb-4">
                  3 AI-powered refinements to perfect every detail
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground dark:text-slate-400">
                  <li>• Change any section instantly</li>
                  <li>• Rewrite content</li>
                  <li>• Adjust colors & fonts</li>
                  <li>• Add/remove sections</li>
                </ul>
              </div>

              {/* Option 2: Get Full Code */}
              <div className="p-6 border-2 border-secondary dark:border-blue-500/30 rounded-xl hover:border-secondary dark:hover:border-blue-500/60 transition-colors">
                <div className="text-3xl mb-3">📦</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-slate-100">
                  Foundation Course - $799
                </h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mb-4">
                  Get the full code package + learning materials
                </p>
                <ul className="text-sm space-y-2 text-muted-foreground dark:text-slate-400">
                  <li>• Production-ready Next.js code</li>
                  <li>• Supabase backend</li>
                  <li>• Stripe payments</li>
                  <li>• Complete documentation</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-accent/10 dark:bg-accent/20 border border-accent rounded-lg">
              <p className="text-sm text-accent-foreground dark:text-accent">
                💡 <strong>Smart Tip:</strong> The $5 customization fee rolls over to any package purchase!
                Start customizing now and upgrade later without paying twice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
