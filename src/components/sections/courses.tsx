import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, Users, Award } from "lucide-react"

const courseFeatures = [
  "4-week group coaching program",
  "Complete textbook access",
  "Community forum",
  "Project-based learning",
  "Website templates included",
  "SEO optimization guide",
  "Deployment assistance",
  "30-day email support"
]

const learningOutcomes = [
  "Build professional websites with Next.js",
  "Master AI-assisted development with Claude",
  "Integrate Airtable for data management", 
  "Deploy to Netlify with custom domains",
  "Implement contact forms and basic e-commerce",
  "Optimize for search engines and performance"
]

export function Courses() {
  return (
    <section id="courses" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Course Information
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn to build professional websites from scratch. Our comprehensive 4-week program 
            teaches you everything you need to create, deploy, and maintain your own website.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Course Curriculum
              </CardTitle>
              <CardDescription>
                4-week intensive program designed for small business owners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {courseFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-accent flex-shrink-0" style={{ stroke: 'currentColor', strokeWidth: 2.5, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <Badge variant="secondary" className="mb-2">
                  Next Cohort Starts: February 15th
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Learning Outcomes
              </CardTitle>
              <CardDescription>
                What you'll be able to build after completing the course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-accent flex-shrink-0" style={{ stroke: 'currentColor', strokeWidth: 2.5, filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.8))' }} />
                    <span className="text-foreground">{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 mb-12 border">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">100+</h3>
              <p className="text-muted-foreground">Successful Students</p>
            </div>
            <div>
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">4 Weeks</h3>
              <p className="text-muted-foreground">To Website Launch</p>
            </div>
            <div>
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">100%</h3>
              <p className="text-muted-foreground">Money-Back Guarantee</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Traditional Web Development vs Web Launch Academy</h3>
            
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-background/80 rounded-lg p-6 border">
                <h4 className="font-semibold mb-4 text-red-600">Traditional Approach</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• $50-200+ monthly hosting fees</li>
                  <li>• Limited customization</li>
                  <li>• Vendor lock-in</li>
                  <li>• Technical dependency</li>
                  <li>• Hidden costs and upgrades</li>
                </ul>
              </div>
              
              <div className="bg-background/80 rounded-lg p-6 border">
                <h4 className="font-semibold mb-4 text-green-600">Web Launch Academy Way</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• One-time learning investment</li>
                  <li>• Complete customization control</li>
                  <li>• Own your code and data</li>
                  <li>• Technical independence</li>
                  <li>• No ongoing subscription costs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/consultation">
                Get Free Consultation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}