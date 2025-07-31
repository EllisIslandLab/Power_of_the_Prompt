# System Architecture Overview

This document provides a high-level overview of the Web Launch Coach platform architecture.

## System Overview

Web Launch Coach is a full-stack web application built with modern technologies to provide web development coaching services. The platform combines educational content, consultation booking, and student portal functionality.

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Forms:** React Hook Form with Zod validation

### Backend
- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **External APIs:** Airtable, Stripe, Zoom

### Hosting & Infrastructure
- **Primary:** Vercel (recommended)
- **Alternative:** Netlify
- **Database:** Hosted PostgreSQL (Railway, Supabase, etc.)
- **CDN:** Built-in with hosting platform

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Landing Page  │ │ Student Portal  │ │ Consultation    ││
│  │   Portfolio     │ │ Textbook        │ │ Booking         ││
│  │   Pricing       │ │ Resources       │ │ Calendar        ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Application                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 API Routes                              ││
│  │ /api/auth/*     /api/consultation  /api/calendar/*     ││
│  │ /api/portfolio  /api/stripe/*      /api/textbook/*     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Database/API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │ PostgreSQL  │ │  Airtable   │ │   Stripe    │ │  Zoom   ││
│  │             │ │ (Business   │ │ (Payments)  │ │(Meetings)││
│  │ (User Data) │ │  Data)      │ │             │ │         ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Data Architecture

### Database Schema (PostgreSQL)
```
Users
├── id (Primary Key)
├── name
├── email (Unique)
├── password (Hashed)
├── role (STUDENT, ADMIN)
├── subscriptionStatus (NONE, ACTIVE, CANCELLED)
├── createdAt
└── updatedAt

Sessions (NextAuth)
├── id
├── sessionToken
├── userId (Foreign Key)
├── expires
└── createdAt

Accounts (NextAuth - OAuth)
├── id
├── userId (Foreign Key)
├── type
├── provider
├── providerAccountId
└── ...
```

### Airtable Schema

**Consultations Table:**
```
Name (Text)
Email (Email)
Phone (Phone)
Business Name (Text)
Business Type (Single Select)
Current Website (URL)
Why Interested (Long Text)
Biggest Challenge (Long Text)
Timeline (Single Select)
Status (Single Select)
Notes (Long Text)
Meeting Type (Text)
Appointment Date (Date)
Appointment Time (Text)
Zoom Meeting ID (Text)
Zoom Join URL (URL)
```

**Portfolio Table:**
```
Title (Text)
Site Name (Text)
Category (Text)
Price (Number)
Description (Long Text)
Demo URL (URL)
Technologies (Multiple Select)
Features (Multiple Select)
Image (Attachment)
Backup URLs (Text)
Order (Number)
```

## Feature Architecture

### 1. Authentication System
```
NextAuth.js Provider Configuration
├── Credentials Provider (Email/Password)
├── Database Adapter (Prisma)
├── Session Management
├── Protected Routes
└── Role-based Access Control
```

### 2. Consultation Booking System
```
Booking Flow
├── Initial Choice (Calendar vs Call Back)
├── Calendar Integration
│   ├── Availability Check
│   ├── Time Slot Selection
│   └── Zoom Meeting Creation
├── Form Submission
│   ├── Validation (Zod)
│   ├── Airtable Storage
│   └── Email Notifications
└── Confirmation System
```

### 3. Student Portal
```
Portal Features
├── Authentication Gate
├── Textbook System
│   ├── Markdown Content
│   ├── Chapter Navigation
│   └── Progress Tracking
├── Resource Library
├── Chat/Support System
└── Collaboration Tools
```

### 4. Payment Processing
```
Stripe Integration
├── Payment Intent Creation
├── Checkout Session Management
├── Webhook Processing
├── Subscription Management
└── Customer Portal
```

## Security Architecture

### Authentication & Authorization
- **Password Hashing:** bcryptjs with salt rounds
- **Session Management:** NextAuth.js secure sessions
- **CSRF Protection:** Built-in Next.js protection
- **API Security:** Environment variables for secrets

### Data Protection
- **Environment Variables:** Sensitive data in .env files
- **API Keys:** Scoped permissions in external services
- **Database:** Connection string encryption
- **HTTPS:** SSL/TLS encryption in production

### Input Validation
- **Frontend:** React Hook Form with Zod schemas
- **Backend:** Server-side validation for all endpoints
- **Sanitization:** HTML/SQL injection prevention
- **Rate Limiting:** (Recommended for production)

## Performance Architecture

### Caching Strategy
- **Static Generation:** Next.js static pages where possible
- **API Caching:** Cache headers for portfolio data
- **Image Optimization:** Next.js Image component
- **CDN:** Automatic with Vercel/Netlify

### Database Optimization
- **Connection Pooling:** Prisma connection management
- **Query Optimization:** Efficient Prisma queries
- **Indexing:** Database indexes on frequently queried fields

### Frontend Optimization
- **Code Splitting:** Automatic with Next.js
- **Tree Shaking:** Remove unused code
- **Bundle Analysis:** Regular bundle size monitoring

## Integration Architecture

### External Service Integration

**Airtable (Business Data):**
```
Purpose: Store business-related data
Data Flow: Form → API Route → Airtable
Fallback: Local database backup (future)
```

**Stripe (Payments):**
```
Purpose: Process payments and subscriptions
Data Flow: Frontend → Stripe → Webhook → Database
Security: Webhook signature verification
```

**Zoom (Video Meetings):**
```
Purpose: Generate meeting links for consultations
Data Flow: Booking → Zoom API → Meeting Details
Fallback: Manual meeting creation
```

## Deployment Architecture

### Development Environment
```
Local Development
├── Next.js Dev Server (Port 3000)
├── Local PostgreSQL Database
├── Airtable Development Base
├── Stripe Test Mode
└── Environment Variables (.env.local)
```

### Production Environment
```
Production Deployment
├── Vercel/Netlify Hosting
├── Hosted PostgreSQL Database
├── Airtable Production Base
├── Stripe Live Mode
├── Custom Domain with SSL
└── Environment Variables (Platform Config)
```

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking:** Consider Sentry integration
- **Performance:** Built-in Vercel analytics
- **Uptime:** Platform monitoring tools
- **Logs:** Platform-provided logging

### Business Analytics
- **Consultation Tracking:** Airtable reporting
- **Payment Analytics:** Stripe dashboard
- **User Analytics:** Consider Google Analytics
- **Conversion Tracking:** Platform-specific tools

## Scalability Considerations

### Current Architecture Limits
- **Database:** PostgreSQL can handle moderate traffic
- **Airtable:** Rate limits may require caching
- **File Storage:** Consider CDN for large files
- **API Routes:** Serverless functions have execution limits

### Future Scaling Options
- **Database:** Connection pooling, read replicas
- **Caching:** Redis for session/data caching
- **File Storage:** AWS S3 or similar
- **CDN:** Dedicated CDN for static assets
- **Microservices:** Split into specialized services

## Development Workflow

### Code Organization
```
Feature-based Structure
├── API Routes (/api/feature/)
├── Page Components (/app/feature/)
├── UI Components (/components/feature/)
├── Business Logic (/lib/feature/)
└── Types (/types/feature.ts)
```

### Development Process
1. **Feature Planning:** Requirements and architecture design
2. **Database Changes:** Prisma migrations
3. **API Development:** Next.js API routes
4. **Frontend Development:** React components
5. **Integration Testing:** End-to-end functionality
6. **Documentation Update:** API and architecture docs
7. **Deployment:** Automated via Git push

---

*For detailed implementation guides, see the [Guides section](../guides/).*