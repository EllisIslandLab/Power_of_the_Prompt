# Email Signup & Lead Management Setup Guide

## ✅ What's Been Created

1. **Supabase Database Schema** - Complete leads table with campaign management
2. **API Route** - `/api/waitlist/signup` for handling email signups
3. **Updated Coming Soon Banner** - Functional email signup with Resend integration
4. **Admin Campaign System** - Email marketing and lead management at `/admin/campaigns`
5. **Environment Variables** - Configured for Supabase, Resend, and Airtable

## 🚀 Setup Steps

### 1. Database Setup (Already Complete!)
The database has been updated with modern lead management:
- **leads table** - Replaces old waitlist table with enhanced features
- **campaigns table** - Email marketing campaigns
- **email_templates** - Reusable email templates
- **campaign_sends** - Email tracking and analytics

### 2. Environment Variables  
Add these to your `.env.local` file:

```bash
# Your existing Supabase URL (you should already have this)
NEXT_PUBLIC_SUPABASE_URL="your_actual_supabase_url"

# Supabase Service Role Key (get this from your Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY="your_actual_service_role_key"

# Resend API Key (you should already have this)
RESEND_API_KEY="your_actual_resend_key"
```

### 3. Test the Email Signup
1. Run `npm run dev`
2. Go to your coming soon page
3. Try signing up with an email
4. Check your email for the welcome message
5. Check your Supabase **leads** table to see the new signup with status='waitlist'

## 📧 Email Template

The welcome email includes:
- Professional branding
- What's coming soon
- Unsubscribe links
- Beautiful HTML design

## 🎯 Admin Management

### View Leads in Supabase:
1. Go to Supabase Dashboard → Table Editor
2. Click on the **leads** table
3. See all signups with status, source, and timestamps
4. Export to CSV when ready to launch

### Advanced Campaign Management:
1. Visit `/admin/login` on your site
2. Access full campaign management at `/admin/campaigns`
3. Create targeted email campaigns
4. Track opens, clicks, and conversions
5. Manage lead progression: waitlist → interested → nurturing → converted

## 🔧 Features

### Email Signup:
- ✅ Duplicate email prevention
- ✅ Email validation
- ✅ Professional welcome emails via Resend
- ✅ Error handling and loading states
- ✅ Success confirmation

### Campaign Management:
- ✅ Lead segmentation and targeting
- ✅ Email campaign creation with templates
- ✅ Open/click tracking with pixels
- ✅ A/B testing capabilities
- ✅ Lead progression workflows
- ✅ Airtable integration for testimonials
- ✅ Admin dashboard with analytics

### Database Features:
- ✅ UTM tracking (source, medium, campaign)
- ✅ Lead status progression (waitlist → interested → nurturing → converted)
- ✅ Custom fields and tags for segmentation
- ✅ Migration tools for data imports

Your complete email marketing and lead management system is ready! 🚀