# Airtable Integration Changelog

This file documents all Airtable table structures and field mappings for the Web Launch Coach application.

## Current Airtable Tables and Field Mappings

### Services Table
**Files:** `src/app/api/services/route.ts`, `src/app/api/services/[id]/route.ts`, `src/app/api/services/sync/route.ts`
**Last Updated:** 2025-07-31

**Required Airtable Fields:**
- `Service Name` (text) - Display name of the service
- `Service Type` (single select: "Course", "Build", "Audit", "Consultation") - Type of service offered
- `Price` (number) - Price in USD dollars
- `Is Active` (checkbox) - Whether service is currently available for purchase

**Optional Airtable Fields:**
- `Description` (long text) - Detailed description of the service
- `Duration Estimate` (text) - Estimated time to complete/deliver
- `Features` (multiple select or long text) - List of features/benefits included
- `Category` (single select) - Service category for filtering
- `Order` (number) - Display order (ascending)
- `Stripe Product ID` (text) - Auto-populated by sync
- `Stripe Price ID` (text) - Auto-populated by sync
- `Created At` (date) - Creation timestamp
- `Updated At` (date) - Last modification timestamp

**Service Type Mappings:**
- "Course" → `course` (frontend)
- "Build" → `build` (frontend)
- "Audit" → `audit` (frontend)
- "Consultation" → `consultation` (frontend)

**Stripe Integration:**
- Services are automatically synced to Stripe products and prices
- Stripe IDs are stored back in Airtable for tracking
- Price changes create new Stripe prices (old ones are deactivated)

### Purchases Table
**Files:** `src/app/api/services/payment/route.ts`, `src/app/api/stripe/webhook/route.ts`
**Last Updated:** 2025-07-31

**Required Fields:**
- `Service ID` (text) - Airtable record ID of purchased service
- `Service Name` (text) - Name of purchased service
- `Customer Email` (email) - Customer's email address
- `Amount` (number) - Amount paid in USD dollars
- `Payment Status` (single select: "pending", "succeeded", "failed", "refunded")
- `Stripe Payment Intent ID` (text) - Stripe payment intent reference
- `Purchased At` (date) - Purchase timestamp

**Optional Fields:**
- `Customer Name` (text) - Customer's full name
- `Service Type` (text) - Type of service purchased
- `Completed At` (date) - When payment was completed
- `Failed At` (date) - When payment failed (if applicable)
- `Metadata` (long text) - Additional payment metadata as JSON

**Payment Status Flow:**
1. `pending` - Payment intent created, waiting for completion
2. `succeeded` - Payment completed successfully
3. `failed` - Payment failed or was declined
4. `refunded` - Payment was refunded (manual status)

### Consultations Table
**Files:** `src/app/api/consultation/route.ts` and `src/app/api/calendar/book/route.ts`
**Last Updated:** 2025-07-31

**Required Form Fields → Airtable Fields:**
- `fullName` → `Name` (text)
- `email` → `Email` (email)
- `phone` → `Phone` (phone number)

**Optional Form Fields → Airtable Fields:**
- `businessName` → `Business Name` (text, defaults to "Not provided")
- `businessType` → `Business Type` (single select: "Service-based", "Product-based", "Non-profit", "Other")
- `currentWebsite` → `Current Website` (URL)
- `websiteDescription` → stored in `Notes` (long text)
- `whyInterested` → `Why Interested` (long text)
- `biggestChallenge` → `Biggest Challenge` (long text)
- `timeline` → `Timeline` (single select: "ASAP", "This week", "Just exploring")

**System-Generated Fields:**
- `Status` (single select: "Email Only", "Calendar Booking", "Call Back Request", "Confirmed")
- `Notes` (long text) - combines booking type, submission timestamp, website type, current host, monthly costs
- `Meeting Type` (text) - for calendar bookings
- `Appointment Date` (date) - for calendar bookings
- `Appointment Time` (text) - for calendar bookings
- `Zoom Meeting ID` (text) - for calendar bookings
- `Zoom Join URL` (URL) - for calendar bookings

**Form Value Mappings:**
- Business Type: `service`→"Service-based", `product`→"Product-based", `nonprofit`→"Non-profit", `other`→"Other"
- Timeline: `asap`→"ASAP", `this-week`→"This week", `exploring`→"Just exploring"
- Current Host: `none`→"None", `squarespace`→"Squarespace", `wix`→"Wix", `wordpress`→"WordPress", `other`→"Other"
- Monthly Costs: `0`→"$0", `1-50`→"$1-50", `51-100`→"$51-100", `100+`→"$100+", `not-sure`→"Not sure"

### Portfolio Table
**File:** `src/app/api/portfolio/route.ts`
**Last Updated:** 2025-07-31

**Airtable Fields → Display Fields:**
- `Title` → `title` (required)
- `Site Name` or `Category` → `siteName` (fallback logic)
- `Price` → `price` (formatted with $ and commas, defaults to "$899")
- `Description` → `description`
- `Category` → `category`
- `Demo URL` → `demoUrl` (defaults to "#")
- `Technologies` → `technologies` (array, split by commas if string)
- `Features` → `features` (array, split by commas if string)
- `Image` → `imageUrl` (uses first attachment, fallback to placeholder)
- `Backup URLs` → `backupUrls` (array, split by commas if string)
- `Order` → used for sorting (ascending)

**Special Handling:**
- Records without titles are filtered out automatically
- Price field accepts both number and string formats
- Arrays can be stored as comma-separated strings in Airtable
- Image field uses first attachment from Airtable attachments

### User Authentication (Prisma Database)
**File:** `src/app/api/auth/signup/route.ts`
**Last Updated:** 2025-07-31

**Note:** This uses PostgreSQL database via Prisma, not Airtable

**Form Fields → Database Fields:**
- `name` → User.name (text)
- `email` → User.email (unique, text)
- `password` → User.password (bcrypt hashed, text)

**System-Generated Fields:**
- `role` → User.role (defaults to "STUDENT")
- `subscriptionStatus` → User.subscriptionStatus (defaults to "NONE")

---

## Change History

### 2025-07-31 - Services Architecture Implementation
- **Added:** Services table with comprehensive service management
- **Added:** Purchases table for tracking service sales and payments
- **Added:** Stripe integration with automatic product/price synchronization
- **Added:** Service-specific webhook handlers for post-purchase automation
- **Added:** Admin interface for managing services and Stripe sync
- **Added:** Dynamic frontend components for service display and payment processing
- **Added:** TypeScript types for complete type safety across service operations

### 2025-07-31 - Initial Documentation
- **Added:** Complete documentation of Consultations table with all form field mappings
- **Added:** Portfolio table field mappings and display logic
- **Added:** User authentication table structure (Prisma)
- **Added:** Form value transformation mappings for dropdown fields

---

## Maintenance Guidelines

When making changes to Airtable field mappings:

1. **Update the code** in the appropriate API route file
2. **Update this CHANGELOG.md** with the new field mappings
3. **Add an entry** to the Change History section with date and description
4. **Test thoroughly** to ensure the integration works correctly
5. **Verify Airtable** field configuration matches the documentation

**Important:** Always maintain backwards compatibility when possible, and document any breaking changes clearly in the Change History section.