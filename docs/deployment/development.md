# Development Setup Guide

This guide helps you set up the Web Launch Coach platform for local development.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **PostgreSQL** (v12 or higher)
- **Code Editor** (VS Code recommended)

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prisma
- TypeScript and JavaScript Language Features

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/weblaunchcoach.git
cd weblaunchcoach
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create `.env.local` file in project root:

```bash
# Copy example environment file
cp .env.example .env.local
```

Configure the following variables:

```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-at-least-32-characters

# Database (Local PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/weblaunchcoach_dev"

# Airtable (Development Base)
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Stripe (Test Keys)
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Email (Development - Optional)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Zoom (Development - Optional)
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
```

## Database Setup

### 1. Install PostgreSQL
**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Development Database
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE weblaunchcoach_dev;
CREATE USER dev_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE weblaunchcoach_dev TO dev_user;
\q
```

### 3. Configure Prisma
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

## Airtable Setup

### 1. Create Development Base
1. Go to [Airtable](https://airtable.com)
2. Create new base: "Web Launch Coach - Dev"
3. Create tables:

**Consultations Table:**
- Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Business Name (Single line text)
- Business Type (Single select: Service-based, Product-based, Non-profit, Other)
- Current Website (URL)
- Why Interested (Long text)
- Biggest Challenge (Long text)
- Timeline (Single select: ASAP, This week, Just exploring)
- Status (Single select: Email Only, Calendar Booking, Call Back Request, Confirmed)
- Notes (Long text)
- Meeting Type (Single line text)
- Appointment Date (Date)
- Appointment Time (Single line text)
- Zoom Meeting ID (Single line text)
- Zoom Join URL (URL)

**Portfolio Table:**
- Title (Single line text)
- Site Name (Single line text)
- Category (Single line text)
- Price (Number)
- Description (Long text)
- Demo URL (URL)
- Technologies (Multiple select or Long text)
- Features (Multiple select or Long text)
- Image (Attachment)
- Backup URLs (Long text)
- Order (Number)

### 2. Generate API Key
1. Go to [Airtable API tokens](https://airtable.com/create/tokens)
2. Create new token with scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
3. Select your development base
4. Copy token to `.env.local`

## Stripe Setup

### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to Test Mode
3. Get test API keys from Developers → API keys

### 2. Configure Webhooks (Optional for development)
1. Install Stripe CLI: `npm install -g stripe-cli`
2. Login: `stripe login`
3. Forward events: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Development Commands

### Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Other Useful Commands
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for production (testing)
npm run build

# Database operations
npx prisma studio          # Database GUI
npx prisma migrate reset   # Reset database
npx prisma db push         # Push schema changes
```

## Project Structure

```
weblaunchcoach/
├── docs/                   # Documentation
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── portal/        # Student portal
│   │   └── consultation/  # Consultation booking
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   ├── sections/     # Page sections
│   │   └── calendar/     # Calendar components
│   ├── content/          # Static content
│   │   └── textbook/     # Textbook markdown files
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript definitions
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## Testing Your Setup

### 1. Basic Functionality
- [ ] Homepage loads at `http://localhost:3000`
- [ ] Portfolio section displays (may be empty initially)
- [ ] Consultation form is accessible
- [ ] Navigation works correctly

### 2. API Endpoints
Test API routes using curl or Postman:

```bash
# Test portfolio endpoint
curl http://localhost:3000/api/portfolio

# Test consultation endpoint (POST)
curl -X POST http://localhost:3000/api/consultation \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "555-1234",
    "timeline": "asap"
  }'
```

### 3. Database Connection
```bash
# Check database connection
npx prisma db pull

# View data in Prisma Studio
npx prisma studio
```

## Common Development Issues

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check connection string format in .env.local
```

### Airtable API Errors
- Verify API key is correct
- Check base ID matches your development base
- Ensure table names match exactly (case-sensitive)

### Environment Variables Not Loading
- Restart development server after changes
- Check `.env.local` is in project root
- Verify no spaces around `=` in environment file

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test locally
npm run dev

# Commit changes
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Database Changes
```bash
# Modify schema in prisma/schema.prisma
# Create migration
npx prisma migrate dev --name add_new_field

# Update Airtable fields if needed
# Update documentation in docs/changelog/CHANGELOG.md
```

### 3. API Changes
- Update API routes in `src/app/api/`
- Update documentation in `docs/api/README.md`
- Test endpoints thoroughly
- Update TypeScript types if needed

---

*For production deployment, see [Production Deployment Guide](./production.md)*