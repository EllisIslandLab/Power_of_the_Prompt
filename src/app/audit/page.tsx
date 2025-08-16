import { TestAudit } from "@/components/sections/test-audit"

export default function WebsiteAudit() {
  return (
    <div className="pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-4 text-center">
          Free Website Audit
        </h1>
        <p className="text-xl text-muted-foreground text-center mb-8">
          Get a comprehensive analysis of your website's performance, SEO, and opportunities for improvement.
        </p>
      </div>
      
      <TestAudit />
    </div>
  )
}