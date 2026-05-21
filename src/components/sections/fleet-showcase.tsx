'use client'

import Image from 'next/image'
import { siteSamples } from '@/data/site-samples'

export function FleetShowcase() {
  // Use the first 2 featured samples
  const featuredSamples = siteSamples.filter(sample => sample.isFeatured).slice(0, 2)

  return (
    <section id="showcase" className="px-5 md:px-16 py-24 max-w-[1440px] mx-auto">
      <div className="flex items-center gap-6 mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white shrink-0">FLEET SHOWCASE</h2>
        <div className="laser-line-blue flex-grow"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featuredSamples.map((sample, index) => (
          <a
            key={index}
            href={sample.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel group relative overflow-hidden rounded-xl block cursor-pointer"
          >
            <div className="p-8 pb-0">
              <span className="text-xs font-bold tracking-[0.1em] text-[#e8ea23] mb-2 block uppercase">
                VESSEL_0{index + 1}: {index === 0 ? 'ENGINE CORE' : 'UI HUB'}
              </span>
              <p className="text-[#c4c7c8] mb-6">{sample.description}</p>
            </div>

            <div className="relative h-[400px] overflow-hidden">
              <Image
                src={sample.image}
                alt={sample.title}
                fill
                className="object-cover opacity-100 md:grayscale md:opacity-50 md:group-hover:grayscale-0 md:group-hover:opacity-100 transition-all duration-700"
                style={index === 1 ? { objectPosition: 'center -300px' } : {}}
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d112a] to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-700"></div>

              {/* HUD overlay elements */}
              <div className={`absolute ${index === 0 ? 'bottom-4 right-4' : 'bottom-4 left-4'} p-4 text-[13px] font-medium tracking-[0.05em] text-white flex flex-col ${index === 0 ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px]">{index === 0 ? 'STABILITY: 99.8%' : 'UI_REV: 04.2'}</span>
                <span className="text-[10px]">{index === 0 ? 'TEMP: OPTIMAL' : 'SYNC: ACTIVE'}</span>
              </div>
            </div>

            <div className="h-1 w-0 bg-white group-hover:w-full transition-all duration-500"></div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </section>
  )
}
