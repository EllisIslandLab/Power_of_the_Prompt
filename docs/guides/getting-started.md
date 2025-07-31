# Getting Started Guide

Welcome to Web Launch Coach development! This guide will help you get up and running quickly.

## Quick Start (5 minutes)

### 1. Prerequisites Check
Ensure you have:
- Node.js v18+ installed (`node --version`)
- Git installed (`git --version`)
- A code editor (VS Code recommended)

### 2. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/your-org/weblaunchcoach.git
cd weblaunchcoach

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### 3. Quick Configuration
Edit `.env.local` with minimal required values:
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-at-least-32-characters-long
DATABASE_URL="postgresql://username:password@localhost:5432/weblaunchcoach_dev"
```

### 4. Start Development
```bash
npm run dev
```
Visit `http://localhost:3000` to see the application!

## Full Setup (30 minutes)

For complete functionality including database, Airtable, and Stripe integration:

### 1. Database Setup
See [Development Setup Guide](../deployment/development.md#database-setup) for detailed PostgreSQL installation and configuration.

### 2. Airtable Configuration
1. Create Airtable account and development base
2. Configure tables (Consultations, Portfolio)
3. Generate API key and update `.env.local`

### 3. Stripe Integration
1. Create Stripe account in test mode
2. Get test API keys
3. Update `.env.local` with Stripe keys

### 4. Verify Setup
Test all major features:
- Homepage loads ✓
- Portfolio displays ✓
- Consultation form works ✓
- Database connection works ✓

## Project Overview

### What is Web Launch Coach?
Web Launch Coach is a comprehensive platform for teaching web development through:
- **Educational Content:** 7-chapter structured textbook
- **Consultation Services:** Custom booking system with calendar integration
- **Student Portal:** Secure area for course materials and resources
- **Portfolio Showcase:** Dynamic portfolio powered by Airtable

### Key Features
- **🎓 Student Portal:** Textbook, resources, chat, collaboration tools
- **📅 Smart Booking:** Calendar integration with Zoom meeting generation
- **💳 Payment Processing:** Stripe integration for subscriptions and one-time payments
- **📱 Responsive Design:** Mobile-first approach with Tailwind CSS
- **🔒 Secure Authentication:** NextAuth.js with role-based access
- **📊 Business Intelligence:** Airtable integration for customer data

## Architecture at a Glance

### Frontend (What Users See)
- **Next.js 15** with React 19 for modern, fast web app
- **Tailwind CSS** for responsive, beautiful design
- **Radix UI** for accessible, professional components

### Backend (What Powers It)
- **Next.js API Routes** for server-side functionality
- **PostgreSQL** for user accounts and secure data
- **Airtable** for business data (consultations, portfolio)
- **Stripe** for payment processing

### External Integrations
- **Zoom** for video meeting generation
- **Resend** for transactional emails
- **Vercel/Netlify** for hosting and deployment

## Development Workflow

### 1. Understanding the Codebase

**Key Directories:**
```
src/
├── app/                 # Next.js 15 App Router
│   ├── api/            # Backend API endpoints
│   ├── portal/         # Student portal pages
│   └── consultation/   # Booking system
├── components/         # Reusable React components
├── content/           # Static content (textbook)
└── lib/               # Utility functions
```

**Important Files:**
- `src/app/layout.tsx` - Main app layout and providers
- `src/app/page.tsx` - Homepage with hero, portfolio, pricing
- `src/components/sections/` - Main page sections
- `docs/` - Comprehensive documentation (you are here!)

### 2. Making Your First Change

**Easy First Task: Update Homepage Text**
1. Open `src/components/sections/hero.tsx`
2. Modify the hero title or description
3. Save and see changes automatically reload
4. Commit your changes: `git add . && git commit -m "Update hero text"`

### 3. Common Development Tasks

**Adding a New Page:**
```bash
# Create new page
touch src/app/new-page/page.tsx

# Add basic component structure
export default function NewPage() {
  return <div>New Page Content</div>
}
```

**Adding a New API Endpoint:**
```bash
# Create API route
touch src/app/api/new-endpoint/route.ts

# Add basic handler
export async function GET() {
  return Response.json({ message: "Hello from API" })
}
```

**Modifying Database Schema:**
```bash
# Edit prisma/schema.prisma
# Then run migration
npx prisma migrate dev --name add_new_field
```

## Understanding the Data Flow

### 1. Consultation Booking Process
```
User fills form → API validates data → Stores in Airtable → Sends confirmation email
     ↓
Calendar booking → Generates Zoom meeting → Updates Airtable → Email with meeting link
```

### 2. Portfolio Display Process
```
Page loads → API fetches from Airtable → Transforms data → Displays with optimized images
```

### 3. Student Portal Access
```
User logs in → NextAuth validates → Checks subscription → Grants access to portal content
```

## Development Best Practices

### 1. Code Organization

**Component Structure:**
```typescript
// components/sections/example.tsx
import { Button } from "@/components/ui/button"

export function ExampleSection() {
  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold">Section Title</h2>
        <Button>Call to Action</Button>
      </div>
    </section>
  )
}
```

**API Route Structure:**
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Process request
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### 2. Environment Management
- Never commit secrets to Git
- Use different values for development/production
- Document required environment variables
- Test with missing environment variables

### 3. Database Changes
- Always create migrations for schema changes
- Test migrations on sample data
- Update TypeScript types after schema changes
- Document breaking changes

### 4. Testing Your Changes
- Test on desktop and mobile
- Verify API endpoints with curl or Postman
- Check database changes with Prisma Studio
- Test payment flows in Stripe test mode

## Getting Help

### Documentation Resources
- **[API Documentation](../api/README.md)** - Complete API reference
- **[Architecture Overview](../architecture/overview.md)** - System design
- **[Deployment Guides](../deployment/)** - Setup and deployment
- **[Changelog](../changelog/CHANGELOG.md)** - Database and API changes

### Development Tools
- **Prisma Studio:** `npx prisma studio` - Database GUI
- **Next.js Docs:** https://nextjs.org/docs - Framework documentation
- **Tailwind CSS Docs:** https://tailwindcss.com/docs - Styling reference

### Troubleshooting Common Issues

**"Module not found" errors:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

**Database connection issues:**
```bash
# Test database connection
npx prisma db pull
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432
```

**Environment variables not loading:**
- Restart development server
- Check `.env.local` is in project root
- Verify no spaces around `=` in environment file

**Airtable API errors:**
- Verify API key and base ID are correct
- Check table names match exactly (case-sensitive)
- Ensure required fields are present

### Getting Support
1. Check existing documentation in `/docs`
2. Search issues in the repository
3. Ask specific questions with error messages
4. Include relevant code snippets and environment details

## Next Steps

### For Beginners
1. **Explore the codebase:** Follow the data flow for one feature
2. **Make small changes:** Update text, colors, or styling
3. **Learn the tools:** Get comfortable with Prisma Studio, Airtable interface
4. **Read documentation:** Understand the architecture and API endpoints

### For Experienced Developers
1. **Review architecture:** Understand the technical decisions
2. **Set up full environment:** Database, Airtable, Stripe integration
3. **Implement a feature:** Add new functionality end-to-end
4. **Optimize performance:** Identify and improve bottlenecks

### Contributing Guidelines
- Follow existing code patterns and conventions
- Update documentation for any API or database changes
- Test thoroughly before submitting changes
- Write clear commit messages describing your changes

---

*Happy coding! For more detailed information, explore the other documentation files in this `/docs` directory.*