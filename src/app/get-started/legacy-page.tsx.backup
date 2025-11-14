import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import DemoSiteGeneratorForm from '@/components/demo-generator/DemoSiteGeneratorForm'

export const dynamic = 'force-dynamic'

// Type for the nested category structure
type CategoryWithParent = {
  id: string
  name: string
  slug: string
  level: number
  parent?: {
    id: string
    name: string
    slug: string
    level: number
    parent?: {
      id: string
      name: string
      slug: string
      level: number
    }
  }
}

// Type for template with nested categories
type TemplateWithCategories = {
  id: string
  name: string
  slug: string
  description: string | null
  form_steps: any
  html_generator_config: any
  category?: CategoryWithParent
}

async function getActiveTemplate(): Promise<TemplateWithCategories | null> {
  // Use simple client for public data - no auth needed
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  return data as TemplateWithCategories | null
}

export default async function GetStartedPage() {
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
