# Services Architecture Documentation

This document describes the comprehensive services architecture that transforms Web Launch Coach into a dynamic, Airtable-driven service platform with full Stripe payment integration.

## Overview

The services architecture allows you to manage all your offerings (courses, website builds, audits, consultations) through Airtable as the single source of truth, with automatic Stripe synchronization and integrated payment processing.

## Architecture Components

### 1. Data Layer (Airtable)

**Services Table**
- Central repository for all service offerings
- Fields: name, type, price, description, features, etc.
- Controls availability and display order
- Automatically syncs with Stripe

**Purchases Table**
- Tracks all service purchases and payments
- Links to Services table via Service ID
- Records customer information and payment status
- Updated by webhook handlers

### 2. API Layer

**Service Management (`/api/services`)**
```
GET /api/services              # List all services (with filtering)
GET /api/services/[id]         # Get specific service
POST /api/services/sync        # Sync services with Stripe
POST /api/services/payment     # Create payment intent
```

**Integration Features:**
- Automatic Airtable → Stripe synchronization
- Payment intent creation with validation
- Webhook handling for payment completion
- Service-specific post-purchase actions

### 3. Frontend Components

**ServicesDisplay Component**
- Dynamic service listing from Airtable
- Filtering by type and category
- Responsive card-based layout
- Real-time availability checking

**ServicePayment Component**
- Stripe Elements integration
- Customer information collection
- Payment processing with validation
- Success/error handling

### 4. Admin Interface

**Services Management Dashboard (`/admin/services`)**
- View all services with sync status
- Bulk and individual Stripe sync
- Service statistics and health monitoring
- Real-time sync results and error reporting

## Data Flow

### Service Creation Flow
1. **Create Service in Airtable** → Add new service record
2. **Sync to Stripe** → Creates Stripe product and price
3. **Update Airtable** → Stores Stripe IDs back in Airtable
4. **Display on Frontend** → Service appears on website

### Purchase Flow
1. **Service Selection** → Customer chooses service
2. **Payment Intent** → Creates Stripe payment intent
3. **Payment Processing** → Customer completes payment
4. **Webhook Processing** → Updates purchase record
5. **Post-Purchase Actions** → Service-specific automation

### Webhook Flow
1. **Stripe Event** → Payment success/failure webhook
2. **Airtable Update** → Update purchase status
3. **Service Actions** → Trigger service-specific workflows
4. **Customer Notifications** → Send confirmation emails

## Service Types and Automation

### Course Services
**Post-Purchase Actions:**
- Grant access to student portal
- Send course materials and login credentials
- Enroll in course-specific resources

### Website Build Services
**Post-Purchase Actions:**
- Create project record in build tracking system
- Send project kickoff materials
- Schedule discovery call

### Audit Services
**Post-Purchase Actions:**
- Send audit questionnaire
- Create audit task in workflow system
- Schedule audit delivery timeline

### Consultation Services
**Post-Purchase Actions:**
- Create consultation booking record
- Send scheduling instructions
- Update consultation queue

## Configuration and Setup

### Required Environment Variables
```bash
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Airtable Table Setup

**Services Table Fields:**
```
Service Name (Single line text) - Required
Service Type (Single select: Course, Build, Audit, Consultation) - Required
Price (Number) - Required
Description (Long text)
Duration Estimate (Single line text)
Features (Multiple select)
Category (Single select)
Order (Number)
Is Active (Checkbox) - Required
Stripe Product ID (Single line text)
Stripe Price ID (Single line text)
Created At (Date)
Updated At (Date)
```

**Purchases Table Fields:**
```
Service ID (Single line text) - Required
Service Name (Single line text) - Required
Customer Email (Email) - Required
Customer Name (Single line text)
Amount (Number) - Required
Payment Status (Single select: pending, succeeded, failed, refunded) - Required
Stripe Payment Intent ID (Single line text) - Required
Service Type (Single line text)
Purchased At (Date) - Required
Completed At (Date)
Failed At (Date)
Metadata (Long text)
```

### Stripe Webhook Configuration

**Required Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `checkout.session.completed`

**Webhook Endpoint:**
```
https://your-domain.com/api/stripe/webhook
```

## Admin Operations

### Syncing Services with Stripe

**Automatic Sync Process:**
1. Fetches all active services from Airtable
2. Creates/updates Stripe products and prices
3. Handles price changes by deactivating old prices
4. Updates Airtable with Stripe IDs
5. Provides detailed sync results and error reporting

**Manual Sync Options:**
- Sync all services at once
- Sync individual services
- View sync status and history

### Monitoring and Maintenance

**Key Metrics to Monitor:**
- Number of active services
- Services synced with Stripe
- Services needing sync
- Recent purchase activity
- Payment success rates

**Regular Maintenance Tasks:**
- Review and sync new services
- Monitor webhook processing
- Update service descriptions and prices
- Clean up inactive services

## Error Handling

### API Error Responses
All API endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional details (development only)"
}
```

### Common Error Scenarios

**Service Sync Errors:**
- Invalid Stripe API credentials
- Network connectivity issues
- Airtable field validation errors
- Stripe product/price creation failures

**Payment Processing Errors:**
- Invalid service ID or price mismatch
- Customer information validation failures
- Stripe payment intent creation errors
- Webhook signature verification failures

### Error Recovery

**Sync Failures:**
- Individual service retry mechanism
- Detailed error logging and reporting
- Manual intervention options in admin interface

**Payment Failures:**
- Automatic purchase record updates
- Customer notification systems
- Manual payment reconciliation tools

## Security Considerations

### API Security
- Environment variable protection for API keys
- Webhook signature verification
- Input validation and sanitization
- Rate limiting recommendations

### Data Protection
- Customer information encryption
- PCI compliance through Stripe
- Minimal data storage requirements
- Secure API key management

## Performance Optimization

### Caching Strategy
- Service data caching with appropriate TTL
- Stripe API response caching
- Frontend component memoization

### Database Optimization
- Efficient Airtable query patterns
- Minimal API calls through batching
- Optimized webhook processing

## Future Enhancements

### Planned Features
- Subscription service support
- Advanced pricing models (tiers, discounts)
- Service bundling capabilities
- Automated email marketing integration
- Advanced analytics and reporting

### Scalability Considerations
- Migration to dedicated database for high volume
- Advanced caching layer implementation
- Microservices architecture for complex workflows
- Advanced admin reporting and analytics

---

*This architecture provides a solid foundation for managing services dynamically while maintaining flexibility for future growth and feature additions.*