# Complete Test Flow - OneselfAI Platform

Follow this guide to verify all core functionality works correctly after setup.

## Pre-Test Checklist

- [ ] PostgreSQL is running
- [ ] `.env.local` is configured with correct database URL and JWT_SECRET
- [ ] `npm install` completed successfully
- [ ] Database schema created (`scripts/00-create-schema.sql` executed)
- [ ] Dev server is running: `npm run dev`
- [ ] No console errors on server startup

## Test 1: Access Home Page

**Steps:**
1. Open http://localhost:3000 in browser
2. Verify page loads without errors

**Expected Results:**
- Homepage displays with hero section
- "Start Free Practice" button visible
- "Try Demo" button visible
- No 404 errors
- No console errors

**Status:** ✓ Pass / ✗ Fail

---

## Test 2: Register New Account

**Steps:**
1. Click "Sign In" button (top right)
2. Click "Register" link on login page
3. Fill in form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `testpass123`
4. Click "Create Account"

**Expected Results:**
- Form submits successfully
- Success toast appears
- Redirected to dashboard OR home page
- User is logged in (navbar shows profile dropdown)

**Notes:**
- Email must be unique (second registration fails)
- Password must be >= 6 characters
- All fields required

**Status:** ✓ Pass / ✗ Fail

---

## Test 3: Login with Created Account

**Steps:**
1. If logged in, click profile dropdown → "Logout"
2. Click "Sign In"
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `testpass123`
4. Click "Sign In"

**Expected Results:**
- Login succeeds
- Success toast displays
- Redirected to home page
- Profile dropdown shows user name
- Navbar shows "Dashboard" link

**Status:** ✓ Pass / ✗ Fail

---

## Test 4: Access Protected Dashboard

**Steps:**
1. (Must be logged in)
2. Click "Dashboard" in navbar
3. Page loads

**Expected Results:**
- Dashboard page loads
- Shows interview statistics:
  - Total Interviews: 0
  - Average Score: 0
  - Best Score: 0
  - Last Score: N/A
- Recent interviews section (empty initially)
- "Start Your First Interview" button
- No 500 errors

**Status:** ✓ Pass / ✗ Fail

---

## Test 5: Access Protected Profile

**Steps:**
1. (Must be logged in)
2. Click profile dropdown in navbar
3. Click "Settings"
4. Page loads

**Expected Results:**
- Profile page displays
- Shows user information (email, name, created date)
- Settings form visible
- No 500 errors

**Status:** ✓ Pass / ✗ Fail

---

## Test 6: Test Protected Routes (Logged Out)

**Steps:**
1. Logout (profile dropdown → "Logout")
2. Try to access `/dashboard` directly in URL bar
3. Observe what happens

**Expected Results:**
- Redirected to login page
- URL shows redirect parameter: `?redirect=/dashboard`
- Login and dashboard loads after successful login

**Status:** ✓ Pass / ✗ Fail

---

## Test 7: Start Interview Setup (Logged In)

**Steps:**
1. (Must be logged in)
2. Click "Interview" in navbar
3. Page loads with setup form

**Expected Results:**
- Interview setup page loads
- Shows interview type selector (Technical, Behavioral, Mixed)
- Shows difficulty selector (Easy, Medium, Hard)
- Can enter job role, experience years, tech stack
- "Start Interview" button present
- No 500 errors

**Status:** ✓ Pass / ✗ Fail

---

## Test 8: Access Public Pages

**Steps:**
Test these pages (no login required):

1. http://localhost:3000/about
2. http://localhost:3000/contact
3. http://localhost:3000/pricing
4. http://localhost:3000/faq

**Expected Results:**
- All pages load successfully
- No 404 errors
- Navigation works
- Content displays correctly

**Status:** ✓ Pass / ✗ Fail

---

## Test 9: Logout Functionality

**Steps:**
1. (Must be logged in)
2. Click profile dropdown
3. Click "Logout"

**Expected Results:**
- Logged out successfully
- Redirected to home page
- Profile dropdown no longer visible
- Cannot access protected routes
- Navbar shows "Sign In" button

**Status:** ✓ Pass / ✗ Fail

---

## Test 10: Database Persistence

**Steps:**
1. Register and login with new account
2. Navigate to dashboard
3. Close browser completely
4. Reopen browser and go to http://localhost:3000
5. Check if still logged in

**Expected Results:**
- Still logged in after browser restart
- Can access protected pages immediately
- User data persists (name in profile dropdown)

**Status:** ✓ Pass / ✗ Fail

---

## Test 11: Error Handling

### Invalid Login Credentials
1. Go to login page
2. Enter wrong password for existing user
3. Try to login

**Expected:**
- Error message: "Invalid email or password"
- No 500 error

---

### Missing Required Fields
1. Go to register page
2. Try to submit empty form
3. Try to submit with missing fields

**Expected:**
- Form validation prevents submit
- Browser shows "required field" messages

---

### Duplicate Email Registration
1. Register account with `test2@example.com`
2. Try to register again with same email

**Expected:**
- Error message: "User already exists"
- No 500 error

---

## Test 12: API Endpoints (via curl or Postman)

### POST /api/register
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Curl User","email":"curl@test.com","password":"pass123"}'
```

**Expected:** 201 status, token cookie set

---

### POST /api/login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"curl@test.com","password":"pass123"}'
```

**Expected:** 200 status, token cookie set

---

### GET /api/auth/me (requires cookie)
```bash
curl http://localhost:3000/api/auth/me \
  -b "token=YOUR_TOKEN_HERE"
```

**Expected:** 200 status, user data returned

---

## Browser Console Checks

While testing, open browser console (F12) and verify:

- [ ] No red error messages
- [ ] No warning about missing environment variables
- [ ] No 404 errors for resources
- [ ] Network tab shows successful API calls (200, 201 status)

---

## Database Checks

Verify data in PostgreSQL:

```bash
psql -U oneselfai -d oneselfai_dev

# Check users table
SELECT id, email, name, created_at FROM users;

# Check login sessions (from cookies)
SELECT * FROM subscriptions;
```

---

## Performance Checks

- [ ] Pages load within 2 seconds
- [ ] Navigation is smooth (no lag)
- [ ] No memory leaks (browser memory stable)
- [ ] Network requests are fast (<200ms)

---

## Final Sign-Off

When all tests pass:

```
✓ Complete Test Flow Passed
✓ Platform is stable
✓ Ready for development/deployment
```

Document any failures and errors for debugging.
