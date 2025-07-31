# API Documentation

This document provides comprehensive information about all API endpoints in the Web Launch Coach platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

### NextAuth Endpoints
- **Base Route:** `/api/auth/[...nextauth]`
- **Sign Up:** `/api/auth/signup`

### User Registration
```typescript
POST /api/auth/signup

Request Body:
{
  "name": string,
  "email": string,
  "password": string (min 6 characters)
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": string,
    "name": string,
    "email": string
  }
}
```

## Services Management

### Get All Services
```typescript
GET /api/services?type=[service_type]&active=[true|false]

Query Parameters:
- type (optional): Filter by service type (course, build, audit, consultation)
- active (optional): Filter by active status (default: true)

Response:
{
  "success": true,
  "data": [
    {
      "id": string,
      "service_name": string,
      "service_type": "course" | "build" | "audit" | "consultation",
      "price": number,
      "description": string,
      "duration_estimate": string,
      "is_active": boolean,
      "stripe_price_id": string,
      "stripe_product_id": string,
      "features": string[],
      "category": string,
      "order": number,
      "created_at": string,
      "updated_at": string
    }
  ]
}
```

### Get Single Service
```typescript
GET /api/services/[id]

Response:
{
  "success": true,
  "data": {
    "id": string,
    "service_name": string,
    "service_type": "course" | "build" | "audit" | "consultation",
    "price": number,
    "description": string,
    "duration_estimate": string,
    "is_active": boolean,
    "stripe_price_id": string,
    "stripe_product_id": string,
    "features": string[],
    "category": string,
    "order": number,
    "created_at": string,
    "updated_at": string
  }
}
```

### Sync Services with Stripe
```typescript
POST /api/services/sync
Headers: Authorization: Bearer admin-token

Request Body:
{
  "action": "sync_all" | "sync_service",
  "serviceId"?: string // Required for sync_service
}

Response:
{
  "success": true,
  "data": {
    "synced_products": number,
    "synced_prices": number,
    "errors": string[]
  }
}
```

### Create Payment Intent
```typescript
POST /api/services/payment

Request Body:
{
  "service_id": string,
  "service_name": string,
  "amount": number, // Amount in cents
  "currency": string, // Default: "usd"
  "customer_email": string,
  "customer_name"?: string,
  "metadata"?: Record<string, string>
}

Response:
{
  "success": true,
  "data": {
    "client_secret": string,
    "payment_intent_id": string
  }
}
```

## Consultation & Booking

### Submit Consultation Request
```typescript
POST /api/consultation

Request Body:
{
  "fullName": string (required),
  "email": string (required),
  "phone": string (required),
  "businessName"?: string,
  "businessType"?: "service" | "product" | "nonprofit" | "other",
  "currentWebsite"?: string,
  "currentHost"?: "none" | "squarespace" | "wix" | "wordpress" | "other",
  "monthlyCosts"?: "0" | "1-50" | "51-100" | "100+" | "not-sure",
  "whyInterested"?: string,
  "biggestChallenge"?: string,
  "timeline": "asap" | "this-week" | "exploring" (required),
  "bookingType": "calendar" | "form",
  "submittedAt": string (ISO date)
}

Response:
{
  "success": true,
  "message": "Consultation request submitted successfully",
  "recordId": string
}
```

### Calendar Availability
```typescript
GET /api/calendar/availability

Response:
{
  "next_available": string,
  "available_slots": [
    {
      "timestamp": string,
      "formatted": string,
      "date": string,
      "time": string,
      "period": "morning" | "afternoon"
    }
  ]
}
```

### Book Calendar Appointment
```typescript
POST /api/calendar/book

Request Body:
{
  "fullName": string (required),
  "email": string (required),
  "phone": string (required),
  "selectedSlot": {
    "timestamp": string,
    "formatted": string,
    "date": string,
    "time": string,
    "period": "morning" | "afternoon"
  },
  "businessName"?: string,
  "websiteDescription"?: string,
  "businessType"?: "service" | "product" | "nonprofit" | "other",
  "currentWebsite"?: string
}

Response:
{
  "success": true,
  "message": "Appointment booked successfully",
  "booking": {
    "id": string,
    "appointment_time": string,
    "zoom_join_url": string,
    "confirmation_sent": boolean
  }
}
```

## Portfolio

### Get Portfolio Items
```typescript
GET /api/portfolio

Response:
{
  "success": true,
  "data": [
    {
      "id": string,
      "title": string,
      "siteName": string,
      "price": string,
      "description": string,
      "category": string,
      "demoUrl": string,
      "technologies": string[],
      "features": string[],
      "imageUrl": string,
      "backupUrls": string[]
    }
  ]
}
```

## Payment Processing

### Create Payment Intent
```typescript
POST /api/stripe/create-payment-intent

Request Body:
{
  "amount": number,
  "currency": string,
  "metadata"?: object
}

Response:
{
  "clientSecret": string,
  "paymentIntentId": string
}
```

### Checkout Session
```typescript
POST /api/checkout

Request Body:
{
  "priceId": string,
  "successUrl": string,
  "cancelUrl": string,
  "customerEmail"?: string
}

Response:
{
  "sessionId": string,
  "url": string
}
```

### Stripe Webhook
```typescript
POST /api/stripe/webhook

Headers:
{
  "stripe-signature": string
}

Body: Raw Stripe webhook payload
```

## Textbook Content

### Get Textbook Content
```typescript
GET /api/textbook/content?slug=[chapter-slug]

Response:
{
  "success": true,
  "content": string (HTML),
  "chapter": {
    "id": string,
    "title": string,
    "sections": Section[]
  }
}
```

## Error Responses

All endpoints may return error responses in this format:

```typescript
{
  "error": string,
  "details"?: string (development only),
  "config"?: object (development only)
}
```

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation error, missing fields)
- **401**: Unauthorized (authentication required)
- **404**: Not Found (endpoint or resource doesn't exist)
- **500**: Internal Server Error (server-side error)

## Rate Limiting

Currently no rate limiting is implemented, but consider implementing it for production:

- Consultation submissions: 5 requests per hour per IP
- Calendar bookings: 10 requests per hour per IP
- Portfolio requests: 100 requests per hour per IP

## Environment Variables Required

```bash
# Airtable
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Database
DATABASE_URL=your_postgresql_url

# Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Zoom (optional)
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
```

---

*For more detailed integration examples and troubleshooting, see the [Guides section](../guides/).*