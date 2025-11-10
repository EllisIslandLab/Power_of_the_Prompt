import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import DemoSiteGeneratorForm from '@/components/demo-generator/DemoSiteGeneratorForm'

export const dynamic = 'force-dynamic'

interface GetStartedPageProps {
  params: Promise<{
    path?: string[]
  }>
}

async function getActiveTemplate() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Get active template with category information
  const { data, error } = await supabase
    .from('niche_templates')
    .select(`
      id,
      name,
      slug,
      description,
      form_steps,
      html_generator_config,
      category:template_categories!category_id(
        id,
        name,
        slug,
        level,
        parent:template_categories!parent_id(
          id,
          name,
          slug,
          level,
          parent:template_categories!parent_id(
            id,
            name,
            slug,
            level
          )
        )
      )
    `)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('Error fetching template:', error)
    return null
  }

  return data
}

export default async function GetStartedPage({ params }: GetStartedPageProps) {
  const template = await getActiveTemplate()

  if (!template) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create Your Website Preview
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get a fully functional website preview in minutes. No credit card required.
          </p>
        </div>

        {/* Template Info */}
        <div className="max-w-4xl mx-auto mb-8 p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{template.category?.parent?.parent?.name}</span>
            <span>›</span>
            <span>{template.category?.parent?.name}</span>
            <span>›</span>
            <span>{template.category?.name}</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">{template.name}</h2>
          <p className="text-muted-foreground">{template.description}</p>
        </div>

        {/* Multi-Step Form */}
        <DemoSiteGeneratorForm template={template} />
      </div>
    </main>
  )
}
