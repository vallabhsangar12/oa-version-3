# Developer Guide - OneselfAI Platform

> Comprehensive guide for developers maintaining and extending the OneselfAI platform.

---

## 📖 Table of Contents

1. [Code Architecture](#code-architecture)
2. [Development Workflow](#development-workflow)
3. [Adding Features](#adding-features)
4. [API Development](#api-development)
5. [Database Operations](#database-operations)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Performance Optimization](#performance-optimization)
9. [Security Practices](#security-practices)
10. [Deployment](#deployment)

---

## 🏗️ Code Architecture

### Directory Structure

```
app/
├── api/
│   ├── auth/                  # Authentication endpoints
│   ├── profile/               # Profile management
│   ├── interview-*/           # Interview-related APIs
│   ├── subscriptions/         # Subscription APIs
│   ├── dashboard-stats/       # Analytics
│   └── resume-upload/         # File uploads

├── interview/
│   ├── page.tsx               # Setup form
│   ├── session/[id]/
│   │   ├── page.tsx          # Overview
│   │   ├── loading/page.tsx  # Countdown
│   │   ├── conduct/page.tsx  # Main UI
│   │   └── [id]/route.ts     # GET endpoint

├── profile/
│   ├── page.tsx               # Profile display
│   ├── settings/page.tsx      # Settings
│   └── upgrade/page.tsx       # Pricing

├── [public pages]/            # Home, About, Contact, etc.

└── layout.tsx                 # Root layout with Toaster

components/
├── navbar.tsx                 # Main navigation
├── footer.tsx                 # Footer
└── ui/                        # shadcn/ui components

lib/
├── interview-questions.ts     # Question bank
├── postgres.ts                # Database connection
└── utils.ts                   # Helper functions

middleware.ts                  # Route protection
```

### Component Hierarchy

```
layout.tsx (Root)
├── Navbar (Global)
├── Page Content
│   ├── Main Sections
│   └── Forms/Cards
├── Footer (Global)
└── Toaster (Global)
```

---

## 🔄 Development Workflow

### Local Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd oneself-ai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Start development server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes to files
# Files auto-reload with HMR

# 3. Test changes
npm run dev  # Already running

# 4. Commit changes
git add .
git commit -m "Add new feature"

# 5. Push to GitHub
git push origin feature/new-feature

# 6. Create Pull Request
# Via GitHub UI
```

### Code Formatting

```bash
# The project uses Prettier (via Next.js)
# Files are auto-formatted on save

# Manual format
npm run format  # If script exists
```

---

## ➕ Adding Features

### Adding a New Page

1. **Create page file**
```typescript
// app/new-feature/page.tsx
'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function NewFeaturePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page content */}
      </main>
      <Footer />
    </div>
  )
}
```

2. **Add to navigation** (if needed)
```typescript
// components/navbar.tsx
const navItems = [
  // ... existing items
  { label: "New Feature", href: "/new-feature" },
]
```

3. **Add route protection** (if needed)
```typescript
// middleware.ts
export const config = {
  matcher: [
    // ... existing matchers
    "/new-feature/:path*",
  ],
}
```

### Adding an API Endpoint

1. **Create route file**
```typescript
// app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Your logic here

    return NextResponse.json({ data: "result" })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Your logic here

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

2. **Add authentication if needed**
```typescript
import { verifyJWT } from '@/src/utils/auth'

const payload = verifyJWT(token)
if (!payload) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
}

const userId = (payload as any).userId
```

3. **Add database fallback**
```typescript
try {
  const postgres = await import('@/lib/postgres')
  const { pool } = postgres
  
  if (!pool) {
    // Return mock data
    return NextResponse.json({ data: mockData })
  }
  
  // Use database
  const result = await pool.query('SELECT * FROM table')
  
} catch (dbError) {
  console.error('[v0] Database error:', dbError)
  // Graceful fallback to mock data
  return NextResponse.json({ data: mockData })
}
```

---

## 🔌 API Development

### API Response Pattern

```typescript
// Success response
return NextResponse.json({
  success: true,
  data: { /* data */ }
}, { status: 200 })

// Error response
return NextResponse.json({
  error: 'User-friendly message'
}, { status: 400 })

// With additional metadata
return NextResponse.json({
  success: true,
  data: { /* data */ },
  meta: { page: 1, total: 100 }
})
```

### Calling APIs from Frontend

```typescript
// GET request
const { data, error, isLoading } = useSWR('/api/endpoint', fetcher)

// POST request with form data
const res = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* data */ }),
  credentials: 'include' // Include cookies
})

// Handling file uploads
const formData = new FormData()
formData.append('file', file)
const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
```

### Error Handling

```typescript
try {
  // Operation
} catch (error) {
  // Always log with [v0] prefix
  console.error('[v0] Error message:', error)
  
  // Return user-friendly error
  return NextResponse.json(
    { error: 'Something went wrong' },
    { status: 500 }
  )
}
```

---

## 🗄️ Database Operations

### Schema Changes

1. **Create migration file**
```sql
-- scripts/04-add-new-table.sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_new_table_user_id ON new_table(user_id);
```

2. **Execute migration**
```bash
# Use the SystemAction tool to execute the script
# Or run manually:
# psql -d your_db -f scripts/04-add-new-table.sql
```

3. **Update types** (if using TypeScript)
```typescript
interface NewTable {
  id: string
  user_id: string
  name: string
  created_at: Date
  updated_at: Date
}
```

### Database Queries

```typescript
// Connection
import { Pool } from 'pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// SELECT
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
)
const user = result.rows[0]

// INSERT
const result = await pool.query(
  'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id',
  [email, name]
)
const newId = result.rows[0].id

// UPDATE
await pool.query(
  'UPDATE users SET name = $1 WHERE id = $2',
  [newName, userId]
)

// DELETE
await pool.query(
  'DELETE FROM users WHERE id = $1',
  [userId]
)

// Transaction
const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query('INSERT INTO ...')
  await client.query('UPDATE ...')
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
} finally {
  client.release()
}
```

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Start dev server
npm run dev

# 2. Test in browser
# Register → Login → Use features → Logout

# 3. Check console for errors
# Open DevTools → Console tab

# 4. Test API endpoints
curl -X GET http://localhost:3000/api/endpoint \
  -H "Cookie: token=YOUR_TOKEN"
```

### Testing Checklist

- [ ] Feature works on desktop
- [ ] Feature works on mobile
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Toast notifications appear
- [ ] API calls successful
- [ ] Database fallback works
- [ ] Auth required APIs protected
- [ ] Form validation working
- [ ] Navigation correct

---

## 🐛 Debugging

### Console Logging

```typescript
// Always use [v0] prefix
console.log('[v0] Variable value:', variable)
console.error('[v0] Error occurred:', error)
console.warn('[v0] Warning message')
```

### Browser DevTools

```
1. Open DevTools (F12)
2. Console tab: Check for errors
3. Network tab: Check API calls
4. Application tab: Check cookies/storage
5. Elements tab: Check HTML structure
```

### Common Issues

**Issue: "Cannot find module"**
```bash
# Solution: Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

**Issue: "Port 3000 already in use"**
```bash
# Solution: Use different port
npm run dev -- -p 3001
```

**Issue: "API returns 401"**
```
Solution: 
- Check token in cookies
- Verify JWT_SECRET matches
- Check token not expired
```

**Issue: "Styles not applying"**
```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run dev
```

---

## ⚡ Performance Optimization

### Code Splitting

```typescript
// Use dynamic imports for large components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => <div>Loading...</div>
})

export default function Page() {
  return <HeavyComponent />
}
```

### Image Optimization

```typescript
import Image from 'next/image'

// Bad
<img src="/image.png" />

// Good
<Image
  src="/image.png"
  alt="Description"
  width={300}
  height={200}
  priority  // For above-fold images
/>
```

### Data Fetching

```typescript
// Use SWR for client-side
import useSWR from 'swr'

const { data } = useSWR('/api/endpoint', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false
})

// Cache with time-based revalidation
const { data } = useSWR('/api/endpoint', fetcher, {
  revalidateInterval: 60000 // 60 seconds
})
```

---

## 🔐 Security Practices

### Input Validation

```typescript
// Always validate input
const email = body.email?.trim()
if (!email || !isValidEmail(email)) {
  return NextResponse.json(
    { error: 'Invalid email' },
    { status: 400 }
  )
}

// Sanitize strings
const name = body.name?.trim().substring(0, 255)
```

### Password Handling

```typescript
// Hash before storing
import bcrypt from 'bcryptjs'

const hashedPassword = await bcrypt.hash(password, 10)

// Verify password
const isValid = await bcrypt.compare(userInput, hashedPassword)
```

### Token Management

```typescript
// Create JWT
import jwt from 'jsonwebtoken'

const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
)

// Verify JWT
const payload = jwt.verify(token, process.env.JWT_SECRET)
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Secrets configured
- [ ] SSL certificate valid
- [ ] Domain configured

### Build and Deploy

```bash
# Build
npm run build

# Test build locally
npm run start

# Deploy to Vercel
git push origin main

# Deploy to other platforms
# Follow platform-specific instructions
```

### Monitoring

```typescript
// Monitor with console logs
console.log('[v0] Action completed')
console.error('[v0] Error occurred')

// Setup error tracking (Sentry)
// Setup analytics (Vercel Analytics)
// Setup uptime monitoring
```

---

## 📊 Best Practices

### File Naming
```
✅ page.tsx               - Page component
✅ route.ts              - API route
✅ layout.tsx            - Layout component
✅ use-hook.ts           - Custom hook
✅ utils.ts              - Utility functions
✅ types.ts              - TypeScript types
```

### Component Structure
```typescript
// Always use proper structure
'use client'  // Client component if needed

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Props {
  title: string
}

export default function Component({ title }: Props) {
  const [state, setState] = useState()
  const router = useRouter()

  const handleAction = async () => {
    // Logic here
  }

  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Error Handling
```typescript
// Always include try-catch
try {
  // Operation
} catch (error) {
  console.error('[v0] Error:', error)
  // Handle gracefully
}
```

### Comments
```typescript
// Only comment complex logic
// ✅ Good: Explains why
// Complex algorithm for score calculation
const score = calculateScore(data)

// ❌ Bad: Obvious code
// Set state to true
setState(true)
```

---

## 🆘 Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| Module not found | `npm install` or check import path |
| Port in use | `npm run dev -- -p 3001` |
| Build error | `rm -rf .next && npm run dev` |
| API 401 error | Check token/auth status |
| Styles not working | Clear cache: `rm -rf .next` |
| Database error | Check DATABASE_URL or use fallback |
| Page blank | Check console for JavaScript errors |
| Slow page load | Check Network tab in DevTools |
| Memory leak | Review useEffect dependencies |
| Type errors | Check tsconfig.json and types |

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)

---

## 🤝 Contributing

When contributing to the project:

1. **Follow code style** - Use existing patterns
2. **Add comments** - Explain complex logic
3. **Test changes** - Verify everything works
4. **Update docs** - Update relevant documentation
5. **Create PR** - Describe changes clearly
6. **Get review** - Get approval before merging

---

## 📞 Getting Help

- Check existing documentation
- Review similar implementations
- Check console for error messages
- Test in different browsers
- Verify environment variables
- Check database connection

---

This guide covers all aspects of developing and maintaining the OneselfAI platform. Refer back as needed when adding features or debugging issues.

Happy coding! 🚀
