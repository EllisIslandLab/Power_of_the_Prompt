# Jitsi Meet Integration Testing Guide

## 🧪 Complete Testing Strategy

### Phase 1: Database & API Testing (Single Device)

**Prerequisites:**
```bash
# 1. Run database migration if needed
npx prisma db push

# 2. Start development server
npm run dev

# 3. Ensure you have test data
```

#### **Test 1: Database Schema**
1. Check Prisma Studio: `npx prisma studio`
2. Verify VideoSession table exists with all fields
3. Check that User table has video session relations

#### **Test 2: API Endpoints**
Use browser dev tools or Postman to test:

```bash
# Test session creation (as admin)
POST /api/sessions/create
{
  "sessionName": "Test Session",
  "sessionType": "FREE_CONSULTATION", 
  "scheduledStart": "2025-01-15T15:00:00Z",
  "scheduledEnd": "2025-01-15T15:30:00Z"
}

# Test user sessions
GET /api/sessions/user/[your-user-id]

# Test session access
GET /api/sessions/[session-id]/access
```

### Phase 2: Single User Flow Testing

#### **Test 3: Calendar Booking Integration**
1. **As a visitor (logged out):**
   - Go to `/consultation`
   - Book a free consultation
   - Check that VideoSession is created in database
   - Verify Airtable record has Jitsi Room ID and URL

2. **Verify in admin:**
   - Check that a new user was created
   - Check that consultation has linked video session
   - Note the Jitsi room URL format

#### **Test 4: Portal Session Management**
1. **As student user:**
   - Login to portal
   - Go to `/portal/collaboration`
   - Switch to "Video Sessions" tab
   - Verify your booked session appears
   - Check session details and timing

2. **As admin user:**
   - Same steps, but verify you see "Host" badge
   - Check that you can see sessions you're hosting

### Phase 3: Two-Device Real Meeting Testing

**Setup Required:**
- Device 1: Your main computer (admin/host)
- Device 2: Another computer, tablet, or phone (student)
- Different browsers on same device work too

#### **Test 5: Free Consultation Flow**
1. **Device 1 (Admin):**
   - Create a test session for 5 minutes from now
   - Or use calendar booking from Device 2

2. **Device 2 (Student):**
   - Register/login as student user
   - Navigate to collaboration page
   - Wait until session is joinable (15 mins before start)
   - Click "Join" button

3. **Device 1 (Admin):**
   - Join the same session
   - Test features: video, audio, chat, screen share

#### **Test 6: Quick Join Testing**
1. **Device 1:** Create a random Jitsi room: `meet.jit.si/test-room-123`
2. **Device 2:** Use Quick Join feature in portal with room ID: `test-room-123`
3. Both devices should join the same room

### Phase 4: Payment Integration Testing

#### **Test 7: Paid Session Flow**
1. **Create paid session (programmatically or via admin):**
```javascript
// In browser console or API tool
fetch('/api/sessions/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionName: "Paid Test Session",
    sessionType: "PAID_SESSION",
    scheduledStart: new Date(Date.now() + 10*60*1000).toISOString(), // 10 mins from now
    scheduledEnd: new Date(Date.now() + 70*60*1000).toISOString()
  })
})
```

2. **Device 2 (Student):**
   - Try to join paid session
   - Should be redirected to payment
   - Use Stripe test card: `4242 4242 4242 4242`
   - After payment, should be able to join

### Phase 5: Error Handling & Edge Cases

#### **Test 8: Access Control**
1. Try joining session too early (more than 15 mins before)
2. Try joining expired session
3. Try joining without payment (for paid sessions)
4. Try accessing session as unauthorized user

#### **Test 9: Session Lifecycle**
1. Join session and immediately leave
2. Have host leave first, then student
3. Test session auto-completion after end time

## 🎯 Recommended Testing Order

### **Quick Start (30 minutes):**
1. Test calendar booking → video session creation
2. Test joining same session from two browsers
3. Test Quick Join feature

### **Comprehensive (2 hours):**
1. All single-device API tests
2. Two-device meeting tests
3. Payment flow testing
4. Edge case testing

### **Real-world Scenario (1 hour):**
1. Book consultation as real visitor
2. Host the session as admin
3. Test recording (if enabled)
4. Check session history

## 🛠️ Testing Tools & Setup

### **Browser Setup:**
```bash
# Device 1: Your main browser (Chrome/Firefox)
# - Admin account logged in
# - Dev tools open for debugging

# Device 2: Different browser or incognito
# - Student account or guest
# - Mobile device for mobile testing
```

### **Useful URLs:**
- Main site: `http://localhost:3000`
- Consultation booking: `http://localhost:3000/consultation`
- Student portal: `http://localhost:3000/portal/collaboration`
- Prisma Studio: `http://localhost:5555` (run `npx prisma studio`)

### **Test Accounts Needed:**
1. **Admin Account** (you already have)
2. **Student Account** (register at `/auth/signup`)
3. **Guest Account** (calendar booking creates one)

## 🐛 Common Issues & Solutions

### **Issue: "Session not found"**
- Check database for VideoSession records
- Verify user permissions and session participation

### **Issue: "Payment required"**
- Ensure Stripe test keys are configured
- Check session type is PAID_SESSION
- Verify payment intent creation

### **Issue: "Cannot join room"**
- Check Jitsi domain in environment variables
- Verify JavaScript console for errors
- Test basic Jitsi functionality at meet.jit.si

### **Issue: "Database errors"**
- Run `npx prisma db push` to sync schema
- Check all relations are properly set up
- Verify Prisma client generation

## ✅ Success Criteria

**Basic Functionality:**
- [ ] Calendar booking creates video sessions
- [ ] Students can see their sessions in portal
- [ ] Two devices can join same Jitsi room
- [ ] Quick join works with room IDs

**Advanced Features:**
- [ ] Payment flow works for paid sessions
- [ ] Access control prevents unauthorized joining
- [ ] Sessions show correct status (scheduled/active/completed)
- [ ] Host vs participant roles work correctly

**User Experience:**
- [ ] No JavaScript errors in console
- [ ] Mobile-responsive interface
- [ ] Clear error messages for edge cases
- [ ] Session timing works correctly (15-min early join window)

## 🚀 Next Steps After Testing

1. **If tests pass:** Ready for production deployment
2. **If issues found:** Debug specific components
3. **Performance testing:** Test with larger groups
4. **User acceptance:** Have real students test the flow

---

**Start with Phase 1 & 2 on a single device, then move to Phase 3 for real video conferencing tests!**