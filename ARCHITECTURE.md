# OneselfAI Platform Architecture

## Overview

OneselfAI is a Next.js 16 full-stack web application for AI-powered interview preparation with real-time emotion and voice analysis.

## Tech Stack

**Frontend:**
- React 19.2 with TypeScript
- Next.js 16 (App Router)
- Tailwind CSS 4.1
- Shadcn/ui components
- SWR for data fetching
- Sonner for notifications

**Backend:**
- Next.js API Routes
- PostgreSQL 12+ (database)
- Node.js runtime
- JWT authentication (jsonwebtoken)
- Bcrypt password hashing

**DevOps:**
- Vercel (deployment ready)
- Git + GitHub
- Environment variables (.env.local)

## Project Structure

```
oa-version-3/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # Authentication routes
│   │   ├── profile/           # Profile management
│   │   ├── dashboard-stats/   # Dashboard data
│   │   ├── interview-*/       # Interview-related
│   │   └── subscriptions/     # Subscription management
│   ├── (public pages)         # Home, About, Contact, etc.
│   ├── dashboard/             # Protected dashboard
│   ├── profile/               # User profile
│   ├── interview/             # Interview setup & conduct
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── navbar.tsx             # Top navigation
│   ├── footer.tsx             # Footer
│   ├── ui/                    # Shadcn UI components
│   └── ...                    # Feature components
├── lib/
│   ├── auth.ts                # Unified auth module
│   ├── postgres.ts            # Database client
│   ├── startup-validation.ts  # Server validation
│   └── interview-questions.ts # Interview data
├── src/utils/
│   ├── auth.ts                # Legacy (deprecated)
│   └── ...                    # Other utilities
├── public/                    # Static assets
├── scripts/
│   └── 00-create-schema.sql   # Database schema
├── middleware.ts              # Request middleware
├── next.config.mjs            # Next.js config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
├── .env.example               # Environment template
└── LOCAL_SETUP.md             # Setup guide
```

## Authentication Flow

### Registration

```
User Form (register page)
        ↓
POST /api/register
        ↓
Validate input
        ↓
Check if email exists
        ↓
Hash password (bcrypt)
        ↓
Insert into users table
        ↓
Create JWT token
        ↓
Set httpOnly cookie
        ↓
Redirect to home (auto-logged in)
```

### Login

```
User Form (login page)
        ↓
POST /api/login
        ↓
Validate input
        ↓
Find user by email
        ↓
Compare password hash
        ↓
Create JWT token
        ↓
Set httpOnly cookie
        ↓
Redirect to home
```

### Protected Routes

```
Browser requests /dashboard
        ↓
Middleware checks for token cookie
        ↓
No token? → Redirect to /login
        ↓
Token exists? → Pass through
        ↓
Component fetches /api/auth/me
        ↓
API verifies JWT
        ↓
Return user data or 401
```

## Database Schema

### Users Table
```sql
id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE
name VARCHAR(255)
password_hash VARCHAR(255)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Interview Sessions Table
```sql
id UUID PRIMARY KEY
user_id UUID FK
job_role VARCHAR(255)
interview_type VARCHAR(50)
difficulty VARCHAR(50)
tech_stack TEXT[]
experience_years INTEGER
status VARCHAR(50)
created_at TIMESTAMP
```

### Interview Results Table
```sql
id UUID PRIMARY KEY
user_id UUID FK
session_id UUID FK
overall_score DECIMAL(5,2)
communication_score DECIMAL(5,2)
technical_score DECIMAL(5,2)
confidence_score DECIMAL(5,2)
emotion_analysis TEXT
voice_analysis TEXT
feedback TEXT
duration_seconds INTEGER
created_at TIMESTAMP
```

### Other Tables
- `subscriptions` - User subscription plans
- `resumes` - Uploaded resumes
- `password_reset_tokens` - Reset token tracking

## API Endpoints

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - Login with credentials
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset with token

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update profile
- `POST /api/profile/change-password` - Change password

### Resume
- `POST /api/resume-upload` - Upload resume
- `DELETE /api/resume-upload` - Delete resume

### Dashboard
- `GET /api/dashboard-stats` - Get stats

### Subscriptions
- `POST /api/subscriptions/select-plan` - Select plan
- `GET /api/subscriptions/check` - Check current plan

### Interviews
- `POST /api/interview-session` - Create session
- `GET /api/interview-session/[id]` - Get session
- `POST /api/interview-results` - Save results
- `GET /api/interview-results/[id]` - Get results

## Key Modules

### lib/auth.ts (Unified Authentication)
```typescript
verifyJWT(token) → AuthPayload | null
signJWT(payload) → string
getUserFromRequest(req) → AuthPayload | null
requireAuth(req) → AuthPayload | 401
setAuthCookie(token, isProduction)
clearAuthCookie()
```

### lib/postgres.ts (Database)
```typescript
getPool() → Pool
query<T>(text, params) → T[]
queryOne<T>(text, params) → T | null
```

### middleware.ts (Protection)
- Protects routes: `/dashboard`, `/profile`, `/interview/*`
- Checks for valid token cookie
- Redirects to login if missing

## Security Features

- **JWT Tokens:** 7-day expiration
- **httpOnly Cookies:** Not accessible to JavaScript
- **Secure Flag:** Only sent over HTTPS in production
- **Password Hashing:** bcrypt with 10 salt rounds
- **Input Validation:** Type checking and sanitization
- **CORS:** Same-origin requests only
- **Route Protection:** Middleware blocks unauthorized access

## Environment Variables

```
POSTGRES_URL          - PostgreSQL connection string
JWT_SECRET           - JWT signing secret
NODE_ENV             - 'development' or 'production'
MONGODB_URI          - (optional) MongoDB connection
```

## Development Workflow

1. Create feature branch
2. Make changes
3. Test locally: `npm run dev`
4. Check console for errors
5. Test API endpoints
6. Commit changes
7. Push to GitHub
8. Deploy to Vercel

## Deployment

The app is deployment-ready to:
- Vercel (recommended)
- AWS Lambda
- Docker container
- Traditional Node.js hosting

### Vercel Deployment
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy

## Performance Optimizations

- Static page generation where possible
- Image optimization
- Code splitting
- Database connection pooling
- JWT caching in cookies
- SWR stale-while-revalidate

## Error Handling

- Try-catch in all API routes
- Graceful fallbacks when DB unavailable
- User-friendly error messages
- Console logging for debugging
- Error tracking ready (for Sentry, etc.)

## Future Enhancements

- [ ] WebSocket for live feedback
- [ ] AI integration (emotion, voice analysis)
- [ ] Payment processing (Stripe)
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Interview recording
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Cache layer (Redis)
