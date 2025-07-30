import { Hero } from "@/components/sections/hero"
import { Portfolio } from "@/components/sections/portfolio"
import { SimplePricing } from "@/components/sections/simple-pricing"

export default function Home() {
  return (
    <main>
      <Hero />
      <Portfolio />
      <SimplePricing />
    </main>
  )
}
