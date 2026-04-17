export interface SiteSample {
  title: string
  description: string
  tech: string
  features: string[]
  image: string
  liveUrl: string
  category: string
  testimonial: string
  studentName: string
  isFeatured: boolean
  realSiteData?: {
    tagline?: string
    credentials?: string[]
    services?: string[]
    approach?: string[]
    location?: string
    contact?: {
      phone?: string
      email?: string
    }
  }
}

export const siteSamples: SiteSample[] = [
  {
    title: "Winchester Therapy Services",
    description: "Clean, straightforward therapy practice website with HIPAA-compliant consultation and appointment booking",
    tech: "Next.js, TypeScript, Vercel, PostCSS, ESLint, Airtable API Integration",
    features: [
      "Simple, confusion-free design with clear user flows",
      "Straightforward call-to-action buttons",
      "HIPAA-compliant consultation booking integration",
      "Calendar appointment booking modal",
      "Airtable integration for secure client data collection",
      "Mobile-responsive professional design"
    ],
    image: "/images/site-samples/screencapture-winchestertherapyservices.webp",
    liveUrl: "https://winchester-therapy-services-blue.vercel.app/",
    category: "Service Business",
    testimonial: "I remember when I was finishing my basement, my parents came over and brought my little brother to help out. Well, he barely lifted a finger. Now, he got me a working website that saves me about $200 per year and I own my own code! Better late than never little bro.",
    studentName: "Michael E.",
    isFeatured: true,
    realSiteData: {
      tagline: "Renew Your Mind, Heal Your Soul",
      credentials: [
        "Michael Ellis, LCSW",
        "Master of Social Work - WVU",
        "Licensed Clinical Social Worker"
      ],
      services: [
        "Individual Therapy",
        "Anxiety Treatment",
        "Depression Counseling", 
        "Relationship Issues",
        "Trauma/PTSD Therapy",
        "Stress Management"
      ],
      approach: [
        "Cognitive Behavioral Therapy (CBT)",
        "Solution-Focused Brief Therapy",
        "Motivational Interviewing"
      ],
      location: "Winchester, VA",
      contact: {
        phone: "(540) 431-7376",
        email: "Michaelfellislcsw@gmail.com"
      }
    }
  },
  {
    title: "A Thyme to Heal",
    description: "Holistic wellness and herbal healing practice website with consultation booking and educational resources",
    tech: "Next.js, TypeScript, Vercel, Airtable Integration",
    features: [
      "Clean, calming wellness-focused design",
      "Service offerings and treatment information",
      "Consultation booking system",
      "Educational herbal healing resources",
      "Mobile-responsive holistic design",
      "Secure client intake forms"
    ],
    image: "/images/site-samples/screencapture-athymetoheal.webp",
    liveUrl: "https://athymetoheal.org",
    category: "Service Business",
    testimonial: "A beautiful website that perfectly captures the essence of holistic healing and natural wellness.",
    studentName: "Wellness Practitioner",
    isFeatured: true,
    realSiteData: {
      tagline: "Natural Healing Through Herbal Wisdom",
      services: [
        "Herbal Consultations",
        "Natural Remedies",
        "Wellness Coaching",
        "Holistic Health Planning"
      ]
    }
  },
  {
    title: "Meche's Creations",
    description: "Creative handmade jewelry and accessories boutique with unique artisan designs and custom pieces",
    tech: "Next.js hosted on Vercel",
    features: [
      "Dynamic seasonal animations",
      "Category filtering for seasonal/holiday products",
      "Personalized consultation booking",
      "Payment processing with Square",
      "Airtable integration for client data collection",
      "Responsive mobile-first design"
    ],
    image: "/images/site-samples/screencapture-mechescreations-v2.webp",
    liveUrl: "https://www.mechescreations.com",
    category: "E-commerce",
    testimonial: "I've given Matt three kids; he built me this website with no hosting fees. It's a start I suppose.",
    studentName: "Maria E.",
    isFeatured: true,
    realSiteData: {
      tagline: "Handcrafted with Love",
      services: [
        "Handmade Jewelry",
        "Custom Designs",
        "Unique Accessories",
        "Artisan Craftsmanship"
      ],
      contact: {
        email: "info@mechescreations.com"
      }
    }
  },
  {
    title: "E-commerce Fashion Store",
    description: "Modern online boutique with advanced filtering, wishlist, and seamless checkout",
    tech: "Next.js, Stripe, Prisma, PostgreSQL",
    features: ["Product Filtering", "Shopping Cart", "Payment Processing", "Order Management", "Customer Reviews"],
    image: "/api/placeholder/400/300",
    liveUrl: "#",
    category: "E-commerce",
    testimonial: "",
    studentName: "",
    isFeatured: false
  },
  {
    title: "Creative Portfolio",
    description: "Stunning portfolio showcasing creative work with smooth animations and project galleries",
    tech: "Next.js, Framer Motion, Tailwind",
    features: ["Project Galleries", "Contact Forms", "Smooth Animations", "SEO Optimized", "Mobile Responsive"],
    image: "/api/placeholder/400/300",
    liveUrl: "#",
    category: "Portfolio",
    testimonial: "",
    studentName: "",
    isFeatured: false
  },
  {
    title: "Consulting Agency",
    description: "Professional business website with service showcases and lead generation forms",
    tech: "Next.js, TypeScript, CMS Integration",
    features: ["Service Pages", "Case Studies", "Lead Forms", "Blog System", "Analytics Dashboard"],
    image: "/api/placeholder/400/300",
    liveUrl: "#",
    category: "Service Business",
    testimonial: "",
    studentName: "",
    isFeatured: false
  },
  {
    title: "Restaurant Chain",
    description: "Multi-location restaurant website with online ordering and reservation system",
    tech: "Next.js, Stripe, Google Maps API",
    features: ["Online Ordering", "Reservation System", "Location Finder", "Menu Management", "Reviews"],
    image: "/api/placeholder/400/300",
    liveUrl: "#",
    category: "E-commerce",
    testimonial: "",
    studentName: "",
    isFeatured: false
  },
  {
    title: "Tech Startup",
    description: "Modern SaaS landing page with product demos and subscription management",
    tech: "Next.js, Stripe, Analytics, API Integration",
    features: ["Product Demos", "Subscription Billing", "User Dashboard", "Analytics", "API Documentation"],
    image: "/api/placeholder/400/300",
    liveUrl: "#",
    category: "Service Business",
    testimonial: "",
    studentName: "",
    isFeatured: false
  },
  {
    title: "Non-Profit Organization",
    description: "Impactful charity website with donation system and volunteer management",
    tech: "Next.js, PayPal API, Volunteer Portal",
    features: ["Donation System", "Volunteer Portal", "Event Calendar", "Impact Tracking", "Newsletter"],
    image: "/api/placeholder/400/300",
    liveUrl: "#",
    category: "Non-Profit",
    testimonial: "",
    studentName: "",
    isFeatured: false
  },
  {
    title: "Photography Studio",
    description: "Elegant portfolio with client galleries, booking system, and print sales",
    tech: "Next.js, Image Optimization, Stripe",
    features: ["Client Galleries", "Booking System", "Print Sales", "Image Protection", "Portfolio Showcase"],
    image: "/api/placeholder/400/300",
    liveUrl: "#",
    category: "Portfolio",
    testimonial: "",
    studentName: "",
    isFeatured: false
  }
]