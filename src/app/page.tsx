import { NewHero } from "@/components/sections/new-hero"
import { SiteSamples } from "@/components/sections/site-samples"
import { ResponsiveComparison } from "@/components/sections/responsive-comparison"
import { BuildWithYou } from "@/components/sections/build-with-you"
import { Build4You } from "@/components/sections/build-4-you"
import { SiteTLC } from "@/components/sections/site-tlc"
import { TestAudit } from "@/components/sections/test-audit"
import { Footer } from "@/components/sections/footer"
import { ScrollProgress } from "@/components/scroll-progress"

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <main className="scroll-smooth">
        <div id="new-hero">
          <NewHero />
        </div>
        <div id="unique-approach">
          <ResponsiveComparison />
        </div>
        <div id="site-samples">
          <SiteSamples />
        </div>
        <div id="build-with-you">
          <BuildWithYou />
        </div>
        <div id="build-4-you">
          <Build4You />
        </div>
        <div id="site-tlc">
          <SiteTLC />
        </div>
        <div id="test-audit">
          <TestAudit />
        </div>
        <Footer />
      </main>
    </>
  )
}
