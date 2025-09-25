# Web Launch Coach

A comprehensive web development coaching platform built with Next.js, featuring student portal, consultation booking, and educational content.

## Features

- 🎓 **Student Portal** - Secure access to textbook content, resources, and collaboration tools  
- 📅 **Smart Booking System** - Custom calendar integration with Jitsi Meet video sessions
- 🎥 **Video Conferencing** - Integrated Jitsi Meet for seamless, browser-based meetings
- 💳 **Payment Processing** - Stripe integration for subscriptions and session payments
- 📱 **Responsive Design** - Mobile-first approach with modern UI components
- 🔒 **Secure Authentication** - NextAuth.js with role-based access control
- 📊 **Business Intelligence** - Airtable integration for customer and portfolio data
- ⚡ **Real-time Sessions** - Live video coaching with recording capabilities

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/weblaunchcoach.git
cd weblaunchcoach
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Documentation

📖 **[Complete Documentation](./docs/README.md)** - Comprehensive guides and references

### Quick Links
- **[Getting Started Guide](./docs/guides/getting-started.md)** - New developer onboarding
- **[API Documentation](./docs/api/README.md)** - Complete API reference
- **[Architecture Overview](./docs/architecture/overview.md)** - System design and data flow
- **[Development Setup](./docs/deployment/development.md)** - Local development environment
- **[Production Deployment](./docs/deployment/production.md)** - Production deployment guide
- **[Airtable Integration](./docs/changelog/CHANGELOG.md)** - Database field mappings and changes

## Technology Stack

- **Framework:** Next.js 15 with App Router, React 19, TypeScript 5
- **Styling:** Tailwind CSS v4, Radix UI components, Lucide React icons
- **Database:** Supabase (PostgreSQL) with real-time subscriptions and RLS
- **Authentication:** Supabase Auth with Row Level Security
- **Email:** Resend for transactional emails and campaign management
- **Payments:** Stripe for subscriptions and one-time payments
- **Video:** Jitsi Meet integration for browser-based conferencing
- **CRM Integration:** Airtable for lead management and testimonials
- **Hosting:** Vercel with serverless functions
- **Campaign Management:** Custom email marketing system with tracking

## Video Conferencing with Jitsi Meet

This platform features a comprehensive video conferencing system built on Jitsi Meet:

### ✨ Key Features
- **Browser-Based** - No downloads required for participants
- **Secure & Private** - End-to-end encrypted communication
- **Session Management** - Full booking, payment, and access control
- **Recording Support** - Automatic recording for paid sessions
- **Multi-Session Types** - Free consultations, paid coaching, group sessions, workshops

### 🎯 Session Types
- **Free Consultations** (30 min) - Open to all visitors
- **1-on-1 Coaching** (60 min) - Paid premium sessions with recording
- **Group Coaching** - Multi-participant collaborative sessions
- **Workshops** - Educational sessions with up to 50 participants
- **Office Hours** - Drop-in support sessions

### 🔧 Configuration
The system uses environment variables for customization:
```bash
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
SESSION_RECORDING_ENABLED=false
FREE_SESSION_DURATION_MINUTES=30
PAID_SESSION_DURATION_MINUTES=60
MAX_PARTICIPANTS_PER_SESSION=10
```

## Project Structure

```
weblaunchcoach/
├── docs/                   # 📖 Comprehensive documentation
├── src/
│   ├── app/               # Next.js app directory (pages & API routes)
│   │   └── api/sessions/  # Video session management APIs
│   ├── components/        # React components
│   │   └── video/         # Jitsi Meet integration components
│   ├── content/          # Static content (textbook chapters)
│   └── lib/              # Utility functions
│       └── jitsi-config.ts # Jitsi configuration
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Environment variables updated for Supabase auth fix
