# 🚨 Quick Fix for Testing Jitsi Integration

## The Issue
You're getting 500 errors because:
1. **Database tables missing** - VideoSession table doesn't exist yet
2. **Airtable is empty** - Calendar booking expects certain fields

## 🔧 Immediate Fixes (Choose One)

### Option 1: Database Fix (Recommended - 2 minutes)
```bash
# Stop the dev server (Ctrl+C)
# Then run:
npx prisma db push
# Wait for it to complete
# Then restart:
npm run dev
```

### Option 2: Skip Database for Now (30 seconds)
Test Jitsi directly without our system:

1. **Two Browser Windows/Tabs:**
   - Window 1: Go to `https://meet.jit.si/weblaunchcoach-test-123`
   - Window 2: Go to `https://meet.jit.si/weblaunchcoach-test-123`
   - You should connect in same room! ✅

2. **Test Portal Quick Join:**
   - Go to `/portal/collaboration`
   - Use Quick Join with room: `weblaunchcoach-test-123`
   - Should open Jitsi in new tab ✅

## 🧪 After Database Fix - Full Test

Once `npx prisma db push` completes:

### Test 1: Create Test Session (API)
```bash
curl -X POST http://localhost:3000/api/sessions/test-create \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"My Test Session"}'
```

### Test 2: View Session in Portal
1. Go to `/portal/collaboration`
2. Click "Video Sessions" tab
3. Should see "My Test Session" 
4. Click "Join" when available

### Test 3: Two-Device Meeting
1. **Device 1:** Your computer - join the test session
2. **Device 2:** Different browser/phone - same session
3. **Result:** Video call! 🎉

## 🐛 If Still Having Issues

### Check Environment Variables
Your `.env` should have:
```bash
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Check Database Connection
```bash
npx prisma studio
# Should open at localhost:5555
# Look for VideoSession table
```

### Calendar Booking Fix (Optional)
If you want calendar booking to work, your Airtable needs these fields in "Consultations" table:
- Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Status (Single line text)
- Jitsi Room ID (Single line text)
- Jitsi Join URL (URL)

## 🎯 Fastest Test Path

**Just want to see Jitsi working?**

1. Open two tabs: `https://meet.jit.si/test-123`
2. Both should join same room
3. Test video/audio ✅

**Want to test the full system?**
1. Fix database with `npx prisma db push`
2. Use test API endpoint to create session
3. Join from portal

**The 500 errors are just database schema issues - the video conferencing part will work fine once the tables exist!**