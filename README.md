# Web Launch Coach

A comprehensive web development coaching platform built with Next.js, featuring student portal, consultation booking, and educational content.

## Features

- 🎓 **Student Portal** - Secure access to textbook content, resources, and collaboration tools
- 📅 **Smart Booking System** - Custom calendar integration with Zoom meeting generation
- 💳 **Payment Processing** - Stripe integration for subscriptions and one-time payments
- 📱 **Responsive Design** - Mobile-first approach with modern UI components
- 🔒 **Secure Authentication** - NextAuth.js with role-based access control
- 📊 **Business Intelligence** - Airtable integration for customer and portfolio data

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

- **Frontend:** Next.js 15, React 19, Tailwind CSS, Radix UI
- **Backend:** Next.js API Routes, PostgreSQL, Prisma ORM
- **Authentication:** NextAuth.js
- **Integrations:** Airtable, Stripe, Zoom, Resend
- **Hosting:** Vercel (recommended) or Netlify

## Project Structure

```
weblaunchcoach/
├── docs/                   # 📖 Comprehensive documentation
├── src/
│   ├── app/               # Next.js app directory (pages & API routes)
│   ├── components/        # React components
│   ├── content/          # Static content (textbook chapters)
│   └── lib/              # Utility functions
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
