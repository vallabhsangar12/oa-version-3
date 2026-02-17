# Quick Start Guide - OneselfAI Platform

## ⚡ Get Running in 2 Minutes

### 1. Install & Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add these variables (optional - app works without DB):
# DATABASE_URL=postgresql://user:pass@localhost/oneself_ai
# JWT_SECRET=your-super-secret-key-here
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open in Browser
```
http://localhost:3000
```

---

## 🎯 Test the Platform (2-Minute Flow)

### Step 1: Create Account (30 seconds)
1. Click "Sign Up" on home page
2. Enter email: `test@example.com`
3. Enter password: `Test123456`
4. Enter name: `Test User`
5. Click "Register"

### Step 2: Select Plan (15 seconds)
1. You'll see pricing page
2. Click "Get Started" on any plan
3. You're now subscribed

### Step 3: Start Interview (30 seconds)
1. Click "Dashboard" in navbar
2. Click "New Interview"
3. Fill form:
   - Interview Type: Technical
   - Difficulty: Medium
   - Job Role: Senior Developer
   - Experience: 5 years
4. Click "Start Interview"

### Step 4: Interview Setup (45 seconds)
1. Click "Start AI Interview"
2. Wait for 10-second countdown
3. Allow camera/microphone access
4. Interview will start

### Step 5: Complete Interview (1-2 minutes)
1. Answer questions (or skip)
2. View results page
3. Download report or take another interview

---

## 🔑 Key Credentials

### Test Account
```
Email: test@example.com
Password: Test123456
```

### Quick Test URLs
```
Home:            http://localhost:3000
Login:           http://localhost:3000/login
Register:        http://localhost:3000/register
Dashboard:       http://localhost:3000/dashboard
Pricing:         http://localhost:3000/pricing
Profile:         http://localhost:3000/profile
```

---

## 🧪 Testing Checklist

### ✅ Must Test
- [ ] User registration
- [ ] User login
- [ ] Plan selection
- [ ] Interview creation
- [ ] Interview flow
- [ ] Results page
- [ ] Dashboard stats
- [ ] Profile editing
- [ ] Mobile responsiveness
- [ ] Logout

### 🧬 Quick API Test
```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Test API
# Test login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# You'll get a response with user data if DB is connected,
# or mock data if not
```

---

## 🆘 Troubleshooting

### "Cannot find module X"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 in use"
```bash
# Use different port
npm run dev -- -p 3001
```

### "Cannot connect to database"
✅ This is OK! App has graceful fallbacks.
- Features still work
- Using mock data
- Set DATABASE_URL in .env.local when ready

### "Camera/Microphone not working"
1. Check browser permissions
2. Make sure HTTPS in production
3. Test permissions in browser settings
4. Try different browser

### "Styles not loading"
```bash
# Clear cache and rebuild
rm -rf .next
npm run dev
```

---

## 📂 Important Files

### For Development
| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with providers |
| `middleware.ts` | Route protection |
| `lib/interview-questions.ts` | Question bank |
| `components/navbar.tsx` | Navigation |

### For Deployment
| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Full deployment guide |
| `.env.example` | Environment variables |
| `scripts/*.sql` | Database setup |
| `next.config.mjs` | Next.js config |

### For Reference
| File | Purpose |
|------|---------|
| `IMPLEMENTATION_SUMMARY.md` | Complete feature list |
| `ROUTE_VERIFICATION.md` | API/route testing |
| `COMPLETION_CHECKLIST.md` | Feature completion |
| `README_PLATFORM.md` | Platform overview |

---

## 🚀 Deploy in 3 Steps

### To Vercel
```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy OneselfAI"
git push origin main

# 2. Go to vercel.com and connect repo
# 3. Set environment variables:
#    - JWT_SECRET
#    - DATABASE_URL (optional)
# Done! Platform is live
```

### To Traditional Server
```bash
# 1. Build
npm run build

# 2. Deploy build folder
scp -r .next/ user@server:/app/

# 3. Restart server
ssh user@server "cd /app && npm start"
```

---

## 📚 Learn More

| Topic | File |
|-------|------|
| Deployment | `DEPLOYMENT.md` |
| All Features | `COMPLETION_CHECKLIST.md` |
| All Routes | `ROUTE_VERIFICATION.md` |
| Architecture | `IMPLEMENTATION_SUMMARY.md` |
| Detailed Docs | `README_PLATFORM.md` |

---

## 💡 Pro Tips

1. **Local Development**
   - Platform works WITHOUT database
   - Uses mock data for testing
   - Set DATABASE_URL to enable persistence

2. **Mobile Testing**
   - Fully responsive
   - Test on actual device for camera/mic

3. **Video Interviews**
   - Requires camera permission
   - Test on HTTPS-enabled server
   - Works on all modern browsers

4. **Interview Results**
   - Mock data generated for testing
   - Replace with real AI analysis later

5. **Environment Setup**
   - Copy .env.example to .env.local
   - Only JWT_SECRET is truly required
   - DATABASE_URL is optional

---

## 🎓 API Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Get Dashboard Stats (with token)
```bash
curl http://localhost:3000/api/dashboard-stats \
  -H "Cookie: token=YOUR_TOKEN_HERE"
```

### Create Interview Session
```bash
curl -X POST http://localhost:3000/api/interview-session \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN_HERE" \
  -d '{
    "interview_type": "technical",
    "difficulty": "medium",
    "job_role": "Senior Developer",
    "experience_years": 5,
    "tech_stack": ["React", "Node.js"]
  }'
```

---

## 🎯 Next Steps

### 1. Explore Features
- [ ] Try all interview types
- [ ] Check dashboard stats
- [ ] Download results
- [ ] Edit profile
- [ ] Change password
- [ ] Upload resume

### 2. Understand Code
- [ ] Check `app/page.tsx` for home
- [ ] Check `app/interview/page.tsx` for setup
- [ ] Check `app/interview/session/[id]/conduct/page.tsx` for main UI
- [ ] Check `app/api/` for all endpoints

### 3. Customize
- [ ] Update colors in `globals.css`
- [ ] Add more questions to `lib/interview-questions.ts`
- [ ] Modify pricing in `app/pricing/page.tsx`
- [ ] Update company info in footer

### 4. Deploy
- [ ] Follow DEPLOYMENT.md
- [ ] Set environment variables
- [ ] Test on staging
- [ ] Deploy to production

---

## ✨ Platform Overview

```
┌─────────────────────────────────────┐
│     OneselfAI Platform Ready         │
├─────────────────────────────────────┤
│                                     │
│  ✅ Authentication & Profiles      │
│  ✅ Interview Setup & Conducting   │
│  ✅ Results & Analytics            │
│  ✅ Subscription System            │
│  ✅ Professional UI                │
│  ✅ Mobile Responsive              │
│  ✅ Security & Validation          │
│  ✅ Error Handling                 │
│                                     │
│  🚀 Ready for Deployment           │
│  🤖 Ready for AI Integration       │
│                                     │
└─────────────────────────────────────┘
```

---

## 🆘 Still Need Help?

1. **Check Documentation**
   - DEPLOYMENT.md - Detailed setup
   - ROUTE_VERIFICATION.md - API testing
   - README_PLATFORM.md - Full overview

2. **Check Code**
   - Look at app/page.tsx for examples
   - Check any route.ts for API structure
   - Review components for React patterns

3. **Check Console**
   - Open browser DevTools
   - Check Network tab for API calls
   - Look for error messages

4. **Try Again**
   - Clear cache: `rm -rf .next`
   - Reinstall: `rm -rf node_modules && npm install`
   - Restart: `npm run dev`

---

## 🎉 You're All Set!

Your OneselfAI platform is now ready to use!

**Next**: Run `npm run dev` and open http://localhost:3000

Happy interviewing! 🚀
