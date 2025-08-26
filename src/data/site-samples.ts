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
    description: "Professional therapy practice with licensed clinical social worker offering individual therapy and specialized treatment",
    tech: "HTML, CSS, JavaScript (in process of optimization to Next.js)",
    features: [
      "Licensed Clinical Social Worker (LCSW)", 
      "Individual Therapy Sessions", 
      "Free 15-minute Consultations", 
      "Anxiety & Depression Treatment",
      "Trauma/PTSD Specialization",
      "Secure Encrypted Communications"
    ],
    image: "https://www.winchestertherapyservices.com",
    liveUrl: "https://www.winchestertherapyservices.com",
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
    title: "Meche's Creations",
    description: "Creative handmade jewelry and accessories boutique with unique artisan designs and custom pieces",
    tech: "HTML, CSS, JavaScript (in process of optimization to Next.js)",
    features: [
      "Handmade Artisan Jewelry",
      "Custom Design Services", 
      "Unique Accessory Collections",
      "Personalized Consultation",
      "Quality Craftsmanship",
      "Creative Portfolio Showcase"
    ],
    image: "https://www.mechescreations.com",
    liveUrl: "https://www.mechescreations.com",
    category: "E-commerce",
    testimonial: "My wife's creative business took off after launching her professional website. The elegant design perfectly showcases her handmade jewelry and attracts customers who value artisan quality.",
    studentName: "Meche C.",
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
    testimonial: "I launched my store and made $10K in the first month. Complete code ownership means no monthly fees!",
    studentName: "Sarah M.",
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
    testimonial: "My portfolio helped me land 3 new clients within weeks of launching. The animations are incredible!",
    studentName: "Jessica L.",
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
    testimonial: "The lead generation features tripled my inquiries. Best investment I've made for my business.",
    studentName: "David K.",
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
    testimonial: "Online orders increased 300% after launch. The system paid for itself in the first week.",
    studentName: "Maria G.",
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
    testimonial: "Launched our MVP in record time. The code quality impressed our investors.",
    studentName: "Alex T.",
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
    testimonial: "Donations increased 150% with our new site. The volunteer portal saves us hours weekly.",
    studentName: "Linda C.",
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
    testimonial: "Bookings doubled and print sales are through the roof. The client galleries are a game-changer.",
    studentName: "Robert P.",
    isFeatured: false
  }
]