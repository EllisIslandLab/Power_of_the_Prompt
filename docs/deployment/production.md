# Production Deployment Guide

This guide covers deploying the Web Launch Coach platform to production environments.

## Pre-Deployment Checklist

### Environment Setup
- [ ] Production domain configured
- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Airtable base configured
- [ ] Stripe account in live mode
- [ ] Email services configured

### Security Review
- [ ] API keys are using production values
- [ ] Database connection is secure
- [ ] CORS policies configured
- [ ] Rate limiting implemented (if applicable)
- [ ] Error messages don't expose sensitive info

## Recommended Hosting Platforms

### Vercel (Recommended)
**Pros:**
- Optimized for Next.js
- Automatic deployments from Git
- Built-in CDN and edge functions
- Easy environment variable management

**Setup:**
1. Connect your repository to Vercel
2. Configure environment variables in dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`

### Netlify
**Pros:**
- Good Next.js support
- Built-in form handling
- Generous free tier
- Easy domain management

**Setup:**
1. Connect repository to Netlify
2. Build command: `npm run build && npm run export`
3. Publish directory: `out`
4. Configure environment variables

## Environment Variables Configuration

### Required Variables
```bash
# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-64-chars-minimum

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Airtable
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Stripe (Live Keys)
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Email (if using Resend)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Zoom (optional)
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
```

### Security Best Practices
- Use different API keys for production
- Rotate secrets regularly
- Use environment-specific databases
- Enable audit logging where possible

## Database Setup

### PostgreSQL (Production)
1. **Create Production Database:**
   ```sql
   CREATE DATABASE weblaunchcoach_prod;
   CREATE USER app_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE weblaunchcoach_prod TO app_user;
   ```

2. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Seed Data (if needed):**
   ```bash
   npx prisma db seed
   ```

## Airtable Configuration

### Production Base Setup
1. **Duplicate Development Base:**
   - Copy structure from development
   - Clear test data
   - Configure field validations

2. **API Token Setup:**
   - Create production-specific API token
   - Limit scopes to necessary permissions
   - Set base-specific access

3. **Table Configuration:**
   - Consultations: Ensure all fields match API expectations
   - Portfolio: Verify image hosting and URLs
   - Configure views for team access

## Stripe Configuration

### Live Mode Setup
1. **Account Verification:**
   - Complete business verification
   - Add bank account details
   - Configure tax settings

2. **Webhook Configuration:**
   ```
   Endpoint URL: https://your-domain.com/api/stripe/webhook
   Events: payment_intent.succeeded, checkout.session.completed
   ```

3. **Product/Price Setup:**
   - Create live products and prices
   - Update price IDs in application
   - Test payment flows

## Domain and SSL

### Custom Domain Setup
1. **DNS Configuration:**
   ```
   A Record: @ -> Your hosting IP
   CNAME: www -> your-domain.com
   ```

2. **SSL Certificate:**
   - Most hosting platforms provide automatic SSL
   - Verify HTTPS redirects work
   - Test certificate validity

## Monitoring and Logging

### Error Monitoring
Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **DataDog** for performance monitoring

### Basic Monitoring Setup
```typescript
// Add to your API routes
if (process.env.NODE_ENV === 'production') {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
}
```

## Performance Optimization

### Next.js Optimizations
1. **Image Optimization:**
   ```typescript
   // Ensure proper image optimization
   import Image from 'next/image'
   ```

2. **Bundle Analysis:**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   npm run build
   ```

3. **Caching Headers:**
   ```typescript
   // In next.config.js
   async headers() {
     return [
       {
         source: '/api/portfolio',
         headers: [
           {
             key: 'Cache-Control',
             value: 's-maxage=300, stale-while-revalidate=59'
           }
         ]
       }
     ]
   }
   ```

## Backup Strategy

### Database Backups
1. **Automated Backups:**
   - Configure daily database backups
   - Store backups in secure location
   - Test restore procedures

2. **Airtable Backups:**
   - Export base data weekly
   - Store in version control or cloud storage
   - Document base structure changes

## Deployment Process

### Automated Deployment (Recommended)
1. **GitHub Actions Example:**
   ```yaml
   name: Deploy to Production
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v20
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.ORG_ID }}
             vercel-project-id: ${{ secrets.PROJECT_ID }}
             vercel-args: '--prod'
   ```

### Manual Deployment
1. **Build Application:**
   ```bash
   npm run build
   npm run start
   ```

2. **Test Locally:**
   - Verify all features work
   - Test API endpoints
   - Check payment flows

3. **Deploy:**
   - Upload to hosting platform
   - Update environment variables
   - Verify deployment

## Post-Deployment Testing

### Critical Path Testing
- [ ] Homepage loads correctly
- [ ] Consultation form submission works
- [ ] Calendar booking functions
- [ ] Portfolio displays properly
- [ ] Payment processing works
- [ ] Student portal access
- [ ] Email notifications sent

### Performance Testing
- [ ] Page load times under 3 seconds
- [ ] API responses under 500ms
- [ ] Images optimize properly
- [ ] Mobile responsive design

## Troubleshooting

### Common Issues

**Environment Variables Not Loading:**
```bash
# Check if variables are set
echo $AIRTABLE_API_KEY
# Restart application after changes
```

**Database Connection Errors:**
```bash
# Test database connection
npx prisma db pull
# Check connection string format
```

**Stripe Webhooks Failing:**
- Verify webhook endpoint URL
- Check webhook secret matches
- Ensure SSL is working

### Rollback Plan
1. Keep previous deployment available
2. Have database backup ready
3. Document rollback procedures
4. Test rollback process in staging

---

*Last updated: 2025-07-31*