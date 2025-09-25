"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, ExternalLink, Star } from "lucide-react"
import { siteSamples } from "@/data/site-samples"

export function SiteSamples() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [selectedSample, setSelectedSample] = useState<any>(null)
  const [rotation, setRotation] = useState(0) // Current wheel rotation in degrees
  const [currentIndex, setCurrentIndex] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  const samples = siteSamples

  const categories = ["All", "E-commerce", "Service Business", "Portfolio", "Non-Profit"]
  
  const filteredSamples = activeCategory === "All" 
    ? samples 
    : samples.filter(sample => sample.category === activeCategory)

  // Use base filtered samples for true infinite behavior
  const baseSamples = filteredSamples.length > 0 ? filteredSamples : samples
  const totalSamples = baseSamples.length
  
  // Find Winchester index in the base samples
  const winchesteBaseIndex = baseSamples.findIndex(sample => sample.title === "Winchester Therapy Services")
  const defaultCenterIndex = winchesteBaseIndex !== -1 ? winchesteBaseIndex : 0

  // Calculate spacing for horizontal wheel
  const itemWidth = 320 // Width of each card
  const spacing = 360 // Space between items

  // Physics-based momentum animation
  const animateWithMomentum = useCallback(() => {
    if (Math.abs(velocity) > 0.1) {
      setRotation(prev => prev + velocity)
      setVelocity(prev => prev * 0.95) // Friction/deceleration
      animationRef.current = requestAnimationFrame(animateWithMomentum)
    }
  }, [velocity])

  useEffect(() => {
    if (velocity !== 0) {
      animationRef.current = requestAnimationFrame(animateWithMomentum)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [velocity, animateWithMomentum])

  // Simple wheel navigation without duplicates
  const moveToNext = () => {
    const nextIndex = (currentIndex + 1) % totalSamples
    setCurrentIndex(nextIndex)
    
    if (isClient) {
      const screenCenter = window.innerWidth / 2
      const cardOffset = itemWidth / 2
      const targetRotation = -nextIndex * spacing + screenCenter - cardOffset
      setRotation(targetRotation)
    }
    setVelocity(0)
  }

  const moveToPrev = () => {
    const prevIndex = currentIndex === 0 ? totalSamples - 1 : currentIndex - 1
    setCurrentIndex(prevIndex)
    
    if (isClient) {
      const screenCenter = window.innerWidth / 2
      const cardOffset = itemWidth / 2
      const targetRotation = -prevIndex * spacing + screenCenter - cardOffset
      setRotation(targetRotation)
    }
    setVelocity(0)
  }

  // Individual arrow hover states
  const [leftArrowHover, setLeftArrowHover] = useState(false)
  const [rightArrowHover, setRightArrowHover] = useState(false)
  
  // Touch handling for mobile swipe - optimized for both directions
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)

  // Minimum distance for a swipe - optimized for mobile sensitivity
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsSwiping(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    setTouchEnd(e.targetTouches[0].clientX)
    // Prevent scrolling while swiping horizontally
    if (touchStart && Math.abs(e.targetTouches[0].clientX - touchStart) > 10) {
      e.preventDefault()
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isSwiping) {
      setIsSwiping(false)
      return
    }
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance  // Swipe left = next
    const isRightSwipe = distance < -minSwipeDistance // Swipe right = previous

    if (isLeftSwipe) {
      moveToNext()
    } else if (isRightSwipe) {
      moveToPrev()
    }
    
    setIsSwiping(false)
  }

  // Initialize with Winchester in center
  useEffect(() => {
    if (totalSamples > 0 && isClient) {
      const winchesteIndex = baseSamples.findIndex(sample => sample.title === "Winchester Therapy Services")
      const centerIndex = winchesteIndex !== -1 ? winchesteIndex : 0
      setCurrentIndex(centerIndex)
      
      // Calculate rotation to center the item on screen
      const screenCenter = window.innerWidth / 2
      const cardOffset = itemWidth / 2  // Half the card width to center it
      const baseRotation = -centerIndex * spacing + screenCenter - cardOffset
      setRotation(baseRotation)
      setVelocity(0)
    }
  }, [totalSamples, baseSamples, spacing, isClient])

  return (
    <section id="site-samples" className="py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Websites Built with <span className="text-primary">Web Launch Academy</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Fully functional live websites using the techniques we teach with modern, professional web technologies: React, Next.js, TypeScript, Tailwind CSS, Vercel, and Prisma. Our clients own their code which means they start their website journey with complete control; not with lock-ins, hidden costs, or fees.
          </p>
          
          {/* Category Tabs */}
          <div className="flex justify-center mb-8 overflow-x-auto">
            <div className="inline-flex bg-muted rounded-xl p-1 min-w-fit">
              {categories.map((category) => (
                <div
                  key={category}
                  className="px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-muted text-muted-foreground whitespace-nowrap"
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        
      {/* Art Gallery Carousel - Full Screen Width */}
      <div className="relative h-96 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Gallery Floor - Full Width with Three-Zone Lighting */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-slate-800/60 via-slate-600 to-slate-800/60" />
        
        {/* Gallery Ceiling - Full Width with Three-Zone Lighting */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-slate-800/60 via-slate-600 to-slate-800/60" />
        
        {/* Left Hover Zone & Arrow - Desktop Only */}
        <div 
          className="absolute left-0 top-0 w-32 h-full z-10 cursor-pointer items-center hidden md:flex"
          onMouseEnter={() => setLeftArrowHover(true)}
          onMouseLeave={() => setLeftArrowHover(false)}
        >
          <button
            onClick={moveToPrev}
            aria-label="Previous site sample"
            className={`ml-2 transition-all duration-500 bg-black/80 backdrop-blur-sm border border-slate-600 hover:bg-black/90 rounded-xl shadow-2xl h-32 w-12 flex items-center justify-center group ${
              leftArrowHover ? 'opacity-90' : 'opacity-0'
            }`}
            disabled={false}
          >
            <ChevronLeft className="h-8 w-8 text-slate-300 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Right Hover Zone & Arrow - Desktop Only */}
        <div 
          className="absolute right-0 top-0 w-32 h-full z-10 cursor-pointer items-center justify-end hidden md:flex"
          onMouseEnter={() => setRightArrowHover(true)}
          onMouseLeave={() => setRightArrowHover(false)}
        >
          <button
            onClick={moveToNext}
            aria-label="Next site sample"
            className={`mr-2 transition-all duration-500 bg-black/80 backdrop-blur-sm border border-slate-600 hover:bg-black/90 rounded-xl shadow-2xl h-32 w-12 flex items-center justify-center group ${
              rightArrowHover ? 'opacity-90' : 'opacity-0'
            }`}
            disabled={false}
          >
            <ChevronRight className="h-8 w-8 text-slate-300 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Horizontal Wheel Container */}
        <div 
          className="w-full h-full flex items-center justify-center overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            ref={wheelRef}
            className="relative flex items-center transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(${rotation}px)`,
              width: `${totalSamples * spacing}px`, // Single cycle - no duplicates
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring bounce effect
            }}
          >
            {Array.from({ length: totalSamples }, (_, index) => {
              const sampleIndex = index % totalSamples
              const sample = baseSamples[sampleIndex]
              // Calculate position relative to screen center
              const itemPosition = index * spacing + rotation + (spacing / 2)
              const centerPosition = isClient ? window.innerWidth / 2 : 640
              const distanceFromCenter = Math.abs(itemPosition - centerPosition)
              
              // Determine if this is the center item based on actual position
              const isCenter = distanceFromCenter < spacing / 4
              const isCenterZone = distanceFromCenter < spacing / 2
              
              // Calculate scale based on distance from center
              const maxDistance = spacing * 1.5
              const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1)
              const scale = isCenter ? 1.0 : Math.max(0.7, 1 - normalizedDistance * 0.3)
              
              return (
                <div
                  key={`${sample.title}-${index}`}
                  className="absolute transition-all duration-500 ease-out"
                  style={{
                    left: `${index * spacing}px`,
                    transform: `scale(${scale})`,
                    zIndex: Math.round((1 - normalizedDistance) * 10),
                  }}
                >
                  {/* Enhanced Gallery Spotlight for Center Item */}
                  {(isCenter || isCenterZone) && (
                    <>
                      <div 
                        className="absolute inset-0 -inset-12 rounded-full blur-xl z-0"
                        style={{
                          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 100%)'
                        }}
                      />
                      <div 
                        className="absolute inset-0 -inset-6 rounded-lg blur-sm z-0"
                        style={{
                          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
                        }}
                      />
                    </>
                  )}
                  
                  <div 
                    className={`group relative overflow-hidden cursor-pointer transition-all duration-700 ease-out ${
                      (isCenter || isCenterZone)
                        ? 'bg-amber-50 border-4 border-amber-400/60 shadow-amber-300/40 shadow-2xl brightness-110' 
                        : 'bg-black border-2 border-slate-600 shadow-black/40 shadow-xl'
                    }`}
                    style={{ 
                      width: `${itemWidth}px`,
                      height: `240px`, // Fixed height to prevent lines
                      borderRadius: '8px', // Flat TV screen look
                    }}
                    onClick={() => setSelectedSample(sample)}
                  >
                    {/* Flat Screen TV Bezel */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black p-2">
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-300 rounded-sm overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                          {sample.title === "Winchester Therapy Services" ? (
                            <div className="w-full h-full bg-white flex flex-col overflow-hidden relative">
                              {/* Multiple screenshot service attempts */}
                              <img
                                src={`https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${sample.liveUrl}`}
                                alt={`${sample.title} website preview showing homepage design and layout`}
                                className="w-full h-full object-cover absolute inset-0 z-10"
                                loading="lazy"
                                decoding="async"
                                width={1024}
                                height={768}
                                onError={(e) => {
                                  // Try alternative service
                                  e.currentTarget.src = `https://image.thum.io/get/width/400/crop/600/${sample.liveUrl}`
                                  e.currentTarget.onerror = () => {
                                    // Both services failed, hide and show fallback
                                    e.currentTarget.style.display = 'none'
                                  }
                                }}
                              />
                              
                              {/* Fallback content */}
                              <div className="w-full h-full bg-white flex flex-col overflow-hidden relative z-0">
                                {/* Header */}
                                <div className="w-full h-10 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center px-3">
                                  <div className="text-white font-bold text-xs">Winchester Therapy Services</div>
                                  <div className="ml-auto flex space-x-2 text-xs text-white/80">
                                    <span>Home</span>
                                    <span>About</span>
                                    <span>Contact</span>
                                  </div>
                                </div>
                                
                                {/* Hero Section */}
                                <div className="flex-1 bg-gradient-to-br from-blue-50 to-slate-50 p-3 flex flex-col">
                                  <div className="text-center mb-3">
                                    <h1 className="text-sm font-bold text-blue-900 mb-1">{sample.realSiteData?.tagline || "Renew Your Mind, Heal Your Soul"}</h1>
                                    <p className="text-xs text-gray-600">{sample.realSiteData?.credentials?.[0] || "Licensed Clinical Social Worker"}</p>
                                    <div className="text-xs text-blue-600 mt-1">🌐 {sample.liveUrl.replace('https://', '')}</div>
                                  </div>
                                  
                                  {/* Services */}
                                  <div className="grid grid-cols-2 gap-1 flex-1 mb-2">
                                    <div className="bg-white rounded p-1 border border-blue-200 shadow-sm">
                                      <div className="text-blue-600 text-xs font-semibold">🧠 Individual Therapy</div>
                                    </div>
                                    <div className="bg-white rounded p-1 border border-teal-200 shadow-sm">
                                      <div className="text-teal-600 text-xs font-semibold">💭 Anxiety Treatment</div>
                                    </div>
                                    <div className="bg-white rounded p-1 border border-green-200 shadow-sm">
                                      <div className="text-green-600 text-xs font-semibold">🤝 Relationship Issues</div>
                                    </div>
                                    <div className="bg-white rounded p-1 border border-purple-200 shadow-sm">
                                      <div className="text-purple-600 text-xs font-semibold">🔐 PTSD/Trauma</div>
                                    </div>
                                  </div>
                                  
                                  {/* Contact Info */}
                                  <div className="bg-blue-900 text-white rounded px-2 py-1 text-center">
                                    <div className="text-xs font-semibold">Free 15-min Consultation</div>
                                    <div className="text-xs opacity-90">{sample.realSiteData?.contact?.phone || "(540) 431-7376"}</div>
                                  </div>
                                </div>
                              </div>
                              
                            </div>
                          ) : sample.title === "Meche's Creations" ? (
                            <div className="w-full h-full bg-white flex flex-col overflow-hidden relative">
                              {/* Multiple screenshot service attempts */}
                              <img
                                src={`https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${sample.liveUrl}`}
                                alt={`${sample.title} website preview showing homepage design and layout`}
                                className="w-full h-full object-cover absolute inset-0 z-10"
                                loading="lazy"
                                decoding="async"
                                width={1024}
                                height={768}
                                onError={(e) => {
                                  // Try alternative service
                                  e.currentTarget.src = `https://image.thum.io/get/width/400/crop/600/${sample.liveUrl}`
                                  e.currentTarget.onerror = () => {
                                    // Both services failed, hide and show fallback
                                    e.currentTarget.style.display = 'none'
                                  }
                                }}
                              />
                              
                              {/* Fallback content */}
                              <div className="w-full h-full bg-white flex flex-col overflow-hidden relative z-0">
                              {/* Header */}
                              <div className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center px-3">
                                <div className="text-white font-bold text-xs">Meche's Creations</div>
                                <div className="ml-auto flex space-x-2 text-xs text-white/80">
                                  <span>Shop</span>
                                  <span>Custom</span>
                                  <span>About</span>
                                </div>
                              </div>
                              
                              {/* Hero Section */}
                              <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 p-3 flex flex-col">
                                <div className="text-center mb-3">
                                  <h1 className="text-sm font-bold text-purple-900 mb-1">{sample.realSiteData?.tagline || "Handcrafted with Love"}</h1>
                                  <p className="text-xs text-gray-600">Unique Artisan Jewelry & Accessories</p>
                                </div>
                                
                                {/* Products */}
                                <div className="grid grid-cols-2 gap-1 flex-1 mb-2">
                                  <div className="bg-white rounded p-1 border border-purple-200 shadow-sm">
                                    <div className="text-purple-600 text-xs font-semibold">💍 Handmade Jewelry</div>
                                  </div>
                                  <div className="bg-white rounded p-1 border border-pink-200 shadow-sm">
                                    <div className="text-pink-600 text-xs font-semibold">✨ Custom Designs</div>
                                  </div>
                                  <div className="bg-white rounded p-1 border border-rose-200 shadow-sm">
                                    <div className="text-rose-600 text-xs font-semibold">🎨 Unique Accessories</div>
                                  </div>
                                  <div className="bg-white rounded p-1 border border-indigo-200 shadow-sm">
                                    <div className="text-indigo-600 text-xs font-semibold">👑 Artisan Quality</div>
                                  </div>
                                </div>
                                
                                {/* CTA */}
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded px-2 py-1 text-center">
                                  <div className="text-xs font-semibold">Shop Unique Creations</div>
                                  <div className="text-xs opacity-90">Custom Orders Available</div>
                                </div>
                              </div>
                              
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col p-2 rounded-sm">
                              {/* Website Header Bar */}
                              <div className="w-full h-6 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t flex items-center px-2 mb-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="ml-4 text-xs text-white/70 truncate">{sample.title}</div>
                              </div>
                              
                              {/* Website Content Area */}
                              <div className="flex-1 bg-white rounded flex flex-col p-2">
                                {/* Header */}
                                <div className="w-full h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded mb-2 flex items-center px-2">
                                  <div className="w-16 h-4 bg-white/30 rounded"></div>
                                </div>
                                
                                {/* Content sections */}
                                <div className="flex-1 space-y-1">
                                  <div className="w-3/4 h-2 bg-gray-300 rounded"></div>
                                  <div className="w-full h-2 bg-gray-200 rounded"></div>
                                  <div className="w-5/6 h-2 bg-gray-200 rounded"></div>
                                  
                                  {/* Feature boxes */}
                                  <div className="flex space-x-1 mt-2">
                                    <div className="flex-1 h-6 bg-blue-100 rounded border border-blue-200"></div>
                                    <div className="flex-1 h-6 bg-green-100 rounded border border-green-200"></div>
                                  </div>
                                </div>
                                
                                {/* Footer */}
                                <div className="w-full h-3 bg-gray-100 rounded mt-1"></div>
                              </div>
                              
                              {/* Category Icon */}
                              <div className="absolute bottom-2 right-2 text-xs font-medium text-gray-600 bg-white/80 px-1 rounded">
                                {sample.category === "E-commerce" ? "🛒" : 
                                 sample.category === "Portfolio" ? "🎨" : 
                                 sample.category === "Non-Profit" ? "❤️" : "💼"}
                              </div>
                            </div>
                          )}
                          
                          {/* Category Tag */}
                          <div className="absolute top-3 right-3">
                            <span className="text-xs bg-slate-800/80 text-white px-2 py-1 rounded-full font-medium">
                              {sample.category}
                            </span>
                          </div>
                          
                          {/* Featured Badge */}
                          {sample.isFeatured && (
                            <div className="absolute top-3 left-3">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-medium">Featured</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                          
                          {/* Testimonial Bar - Only on center items with testimonials */}
                          {isCenter && sample.testimonial && sample.studentName && (
                            <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                              <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4">
                                <h3 className="text-white font-semibold text-sm mb-1">{sample.title}</h3>
                                <blockquote className="text-white/90 text-xs italic mb-2 leading-relaxed">
                                  "{sample.testimonial}"
                                </blockquote>
                                <cite className="text-white/80 text-xs font-medium">- {sample.studentName}</cite>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-slate-400">
            <span className="hidden md:inline">Hover left/right for navigation arrows • </span>
            <span className="md:hidden">Swipe left/right to navigate • </span>
            Click to browse gallery • Live websites included
          </p>
        </div>
      </div>
        
      {/* Enhanced Modal with Full Testimonial */}
      {selectedSample && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedSample(null)}>
          <div className="bg-background rounded-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold text-foreground">{selectedSample.title}</h3>
                    {selectedSample.isFeatured && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">Featured</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {selectedSample.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSample(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Live Website Preview */}
              <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl mb-8 relative overflow-hidden">
                {(selectedSample.title === "Winchester Therapy Services" || selectedSample.title === "Meche's Creations") ? (
                  <div className="w-full h-full rounded-xl overflow-hidden border border-border relative">
                    {/* Website screenshot preview */}
                    <img
                      src={`https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${selectedSample.liveUrl}`}
                      alt={`${selectedSample.title} Preview`}
                      className="w-full h-full object-cover absolute inset-0 z-10"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        // Try alternative service
                        e.currentTarget.src = `https://image.thum.io/get/width/800/crop/600/${selectedSample.liveUrl}`
                        e.currentTarget.onerror = () => {
                          // Both services failed, show fallback
                          e.currentTarget.style.display = 'none'
                        }
                      }}
                    />
                    
                    {/* Fallback overlay if screenshot fails */}
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-blue-50 to-blue-100 z-0">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🌐</div>
                        <div className="text-xl font-medium mb-2">{selectedSample.title}</div>
                        <div className="text-sm text-muted-foreground mb-4">Live website available</div>
                        <a
                          href={selectedSample.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Visit Live Site
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-8xl mb-4">🖥️</div>
                      <div className="text-xl font-medium">{selectedSample.category} Demo</div>
                      <div className="text-sm text-muted-foreground mt-2">Portfolio showcase example</div>
    </div>
                  </div>
                )}
              </div>
              
              {/* Full Student Testimonial */}
              {selectedSample.testimonial && selectedSample.studentName && (
                <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg">{selectedSample.studentName.charAt(0)}</span>
                    </div>
                    <div>
                      <blockquote className="text-foreground italic text-lg mb-3 leading-relaxed">
                        "{selectedSample.testimonial}"
                      </blockquote>
                      <cite className="text-primary font-semibold">— {selectedSample.studentName}</cite>
                      <p className="text-xs text-muted-foreground mt-1">{selectedSample.studentName === "Maria E." ? "Wife & Mother" : selectedSample.studentName === "Michael E." ? "Big Brother" : "Web Launch Academy Graduate"}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-4 text-lg">Key Features Built</h3>
                  <ul className="space-y-3">
                    {selectedSample.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <span className="text-green-500 font-bold">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-4 text-lg">Technology Stack</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{selectedSample.tech}</p>
                  <p className="text-muted-foreground leading-relaxed">{selectedSample.description}</p>
                </div>
              </div>
              
              {selectedSample.liveUrl && selectedSample.liveUrl !== "#" && (
                <div className="flex justify-center">
                  <a
                    href={selectedSample.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Live Site
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  )
}