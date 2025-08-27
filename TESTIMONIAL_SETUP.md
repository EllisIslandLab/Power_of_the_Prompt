# Testimonial Submission System Setup

## Airtable Table Setup

Create a new table in your existing Airtable base called **"Testimonial Submissions"** with the following fields:

### Required Fields:

1. **Name** (Single line text)
   - The person's name who submitted the testimonial

2. **Testimonial** (Long text)  
   - The actual testimonial content

3. **Status** (Single select)
   - Options: "Pending Review", "Approved", "Rejected", "Needs Changes"
   - Default: "Pending Review"

4. **Submitted Date** (Date)
   - When the testimonial was submitted
   - Auto-populated by the API in YYYY-MM-DD format

5. **Email** (Email)
   - Contact email for the testimonial submitter
   - May be empty if user doesn't provide it
   - Required for testimonial updates (security feature)

6. **Arrangement** (Number)
   - Controls display order and visibility
   - 0 = Hidden (default for new submissions)
   - 1, 2, 3... = Display order on website
   - Set to positive number to make testimonial visible

7. **Existing Waitlist User** (Single select)
   - Options: "Yes", "No"
   - Tracks if user was already in waitlist
   - Auto-populated by the API

8. **Updated Date** (Date)
   - When the testimonial was last modified
   - Auto-populated by the API in YYYY-MM-DD format

9. **Title/Role** (Single line text)
   - User's job title or role
   - Default: "Customer" if not provided

10. **Avatar** (Single line text)
    - Emoji avatar for display
    - Default: "😊" if not provided

### Optional Fields (you can add these for enhanced management):

11. **Approved Date** (Date)
    - When you approved the testimonial

12. **Notes** (Long text)
    - Your internal notes about the testimonial

13. **Rating** (Single select)
    - Options: "⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"

## How It Works:

### Testimonial Submission Flow:
1. **User submits testimonial** → Gets saved to Airtable with:
   - Status: "Pending Review"
   - Arrangement: 0 (hidden)
   - All user-provided data

### Admin Approval Process:
2. **Review testimonial in Airtable**:
   - Change Status to "Approved" or "Rejected"
   - For approved testimonials: Set Arrangement to positive number (1, 2, 3...)
   - Lower numbers display first (Arrangement 1 shows before Arrangement 2)

### Website Display:
3. **Testimonials appear on site when**:
   - Status = "Approved" AND Arrangement > 0
   - Displayed in Arrangement order (1, 2, 3...)
   - Featured testimonials always show (hardcoded)
   - All approved testimonials accessible via "View More" modal with pagination

### User Updates:
4. **Users can update their testimonials**:
   - Must provide the same email used for original submission
   - Updates existing record instead of creating duplicate
   - No email = can only create new testimonials, never update

## Environment Variables:

Make sure you have these set up (should already exist from your calendar booking):
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`

## Testing:

### Basic Functionality:
1. **Submit a test testimonial** through the website form
2. **Check Airtable** for the new "Testimonial Submissions" table
3. **Verify fields** are populated correctly:
   - Status: "Pending Review"
   - Arrangement: 0
   - All submitted data present

### Approval & Display:
4. **Approve testimonial**:
   - Change Status to "Approved"
   - Set Arrangement to 1 (or higher number)
5. **Check website** - testimonial should appear in "View More" modal
6. **Test ordering** by setting different Arrangement numbers

### Update Functionality:
7. **Test testimonial updates**:
   - Resubmit with same email → should update existing
   - Resubmit without email → should create new record
   - Try updating with different email → should create new record

## Security Features:

- **Email-based authentication** for updates prevents testimonial hijacking
- **Admin-controlled visibility** through Arrangement field
- **Waitlist conflict prevention** - existing waitlist users don't get duplicate entries
- **Input validation** - testimonials must be 10-1000 characters

## API Endpoints:

- **POST** `/api/testimonials/submit` - Submit/update testimonials
- **GET** `/api/testimonials` - Fetch approved testimonials (Arrangement > 0)

## Current Features:

✅ **Testimonial submission and updates**
✅ **Arrangement-based ordering system**  
✅ **Modal display with pagination (6 per page)**
✅ **Prefetched data for seamless experience**
✅ **Security via email authentication**
✅ **Waitlist integration**
✅ **Featured testimonials (hardcoded)**