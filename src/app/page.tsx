import { Hero } from "@/components/sections/hero"
import { Portfolio } from "@/components/sections/portfolio"
import { ServicesHomepage } from "@/components/sections/services-homepage"

export default function Home() {
  return (
    <main>
      <Hero />
      <Portfolio />
      <ServicesHomepage />
    </main>
  )
}
