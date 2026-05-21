'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Testimonial {
  id: string
  name: string
  testimonial: string
  title: string
  avatar: string
  email: string
  submittedDate: string
  updatedDate: string
  arrangement: number
}

export function SpaceTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)

  // Featured testimonials
  const featuredTestimonials = [
    {
      id: 1,
      name: "CDR. MARCUS THORNE",
      title: "FLEET COMMANDER, NEBULA-7",
      testimonial: "Web Launch Academy isn't just about code; it's about tactical superiority. I went from junior developer to commanding full-stack projects in record time.",
      avatar: "MT"
    },
    {
      id: 2,
      name: "LT. ELENA VANCE",
      title: "SYSTEMS ARCHITECT, VECTOR CORP",
      testimonial: "Navigation through the tech landscape was chaotic until I integrated the Academy's frameworks. Now, my systems are modular, scalable, and resilient.",
      avatar: "EV"
    }
  ]

  // Fetch testimonials from Airtable
  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials')
      const data = await response.json()

      if (data.success) {
        setTestimonials(data.testimonials)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoadingTestimonials(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  return (
    <section id="testimonials" className="bg-[#080c25]/50 py-24 border-y border-white/5">
      <div className="px-5 md:px-16 max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">PILOT LOGS</h2>
          <p className="text-xs font-bold tracking-[0.1em] text-[#c4c7c8] uppercase">TRANSMISSIONS FROM THE FRONTIER</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {featuredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex gap-8 items-start">
              <div className="shrink-0 relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-[#274788]/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{testimonial.avatar}</span>
                </div>
                <span className="absolute -bottom-1 -right-1 material-symbols-outlined text-[16px] text-[#e8ea23] bg-[#0d112a] rounded-full p-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <div className="space-y-4">
                <p className="text-base text-[#dee0ff] italic leading-relaxed">"{testimonial.testimonial}"</p>
                <div>
                  <h4 className="text-xs font-bold tracking-[0.1em] text-white uppercase">{testimonial.name}</h4>
                  <p className="text-[13px] font-medium tracking-[0.05em] text-[#c4c7c8]">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional testimonials from database - shown if available */}
        {!loadingTestimonials && testimonials.length > 0 && (
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial) => (
                <div key={testimonial.id} className="glass-panel rounded-xl p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Image
                        key={i}
                        src="/images/elements/rank-star.png"
                        alt="star"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                        style={{ mixBlendMode: 'lighten' }}
                      />
                    ))}
                  </div>
                  <blockquote className="text-sm mb-4 italic text-white leading-relaxed">
                    "{testimonial.testimonial}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#274788]/30 flex items-center justify-center">
                      <span className="text-sm text-[#e8ea23] font-bold">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">{testimonial.name}</div>
                      <div className="text-xs text-[#c4c7c8]">{testimonial.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </section>
  )
}
