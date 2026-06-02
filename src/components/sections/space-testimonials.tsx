'use client'

import Image from 'next/image'

interface Testimonial {
  id: string
  name: string
  testimonial: string
  title: string
  avatar: string
  projectName?: string
  projectUrl?: string
}

export function SpaceTestimonials() {
  // Hardcoded testimonials for performance
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Illiana Smith',
      testimonial: 'Matt built my herbal wellness website with beautiful attention to detail. The site perfectly captures the calming essence of natural healing, and I love that I own everything outright!',
      title: 'Holistic Wellness Practitioner',
      avatar: 'IS',
      projectName: 'A Thyme to Heal',
      projectUrl: 'https://athymetoheal.org'
    },
    {
      id: '2',
      name: 'Davey',
      testimonial: 'Matthew has been very helpful in getting our web site up. Working through modification and optimizations has been straight forward. Scheduling our training has been a problem at our end, so I don\'t have any opinion formed on that yet.',
      title: 'Business Owner',
      avatar: 'D'
    }
  ]

  return (
    <section id="testimonials" className="bg-[#080c25]/50 py-24 border-y border-white/5">
      <div className="px-5 md:px-16 max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">PILOT LOGS</h2>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <p className="text-xs font-bold tracking-[0.1em] text-[#c4c7c8] uppercase">Verified Google Reviews</p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
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
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#274788]/30 flex items-center justify-center">
                      <span className="text-sm text-[#e8ea23] font-bold">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">{testimonial.name}</div>
                      <div className="text-xs text-[#c4c7c8]">{testimonial.title}</div>
                    </div>
                  </div>
                  {testimonial.projectName && testimonial.projectUrl && (
                    <a
                      href={testimonial.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#b0c6ff] hover:text-white transition-colors inline-flex items-center gap-1 ml-[52px]"
                    >
                      Review for: {testimonial.projectName} →
                    </a>
                  )}
                </div>
              ))}
        </div>

        {/* View all Google Reviews link */}
        <div className="flex justify-center mt-12">
          <a
            href="https://g.page/r/CWbHy700H0C1EBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-sm font-bold text-white uppercase tracking-wider transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            View all reviews on Google
          </a>
        </div>
      </div>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </section>
  )
}
