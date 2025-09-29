# Stripe Webhook Setup

## Local Development Setup Complete ✅

### Installed:
- Stripe CLI v1.30.0
- Webhook listener configured for `localhost:3000/api/stripe/webhook`

### Environment Variables Required:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test for local, live for production)
- `STRIPE_SECRET_KEY` (test for local, live for production)
- `STRIPE_WEBHOOK_SECRET` (local: whsec_909df..., production: TBD)

### Current Status:
- Local webhook secret generated: `whsec_909df9da5283645f13356301a3970dbdd0b4440a5369f0dd07f9225a77f3676c`
- Need to create test pricing table for local development
- Production deployment ready with rotated keys

### Next Steps:
1. Create test pricing table in Stripe Dashboard (test mode)
2. Update pricing table ID in code for local testing
3. Set up production webhook endpoint for live deployment

### Webhook Endpoints:
- Local: `http://localhost:3000/api/stripe/webhook`
- Production: `https://yourdomain.com/api/stripe/webhook`

### Commands:
```bash
# Start webhook listener (keep running during development)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook
stripe trigger payment_intent.succeeded
```