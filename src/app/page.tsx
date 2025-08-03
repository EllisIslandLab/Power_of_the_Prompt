import { Hero } from "@/components/sections/hero"
import { Portfolio } from "@/components/sections/portfolio"
import { ServicesHomepage } from "@/components/sections/services-homepage"
import { Footer } from "@/components/sections/footer"

export default function Home() {
  return (
    <main>
      <Hero />
      <Portfolio />
      <ServicesHomepage />
      <Footer />
    </main>
  )
}
