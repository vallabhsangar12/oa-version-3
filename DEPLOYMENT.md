# OneselfAI Platform - Deployment Guide

## Project Overview

OneselfAI is a professional AI-powered interview preparation platform featuring:
- Real-time facial emotion detection
- Voice analysis (clarity, pace, tone, pronunciation)
- Behavioral and technical interview practice
- Subscription-based pricing model
- Real-time results and feedback

## Architecture

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: SWR for data fetching
- **Toast Notifications**: Sonner

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: PostgreSQL (optional, with graceful fallbacks)
- **Authentication**: JWT-based with HTTP-only cookies
- **Password Hashing**: bcrypt

### AI/ML Features (Ready for Integration)
- Facial Emotion Detection (TensorFlow.js / MediaPipe compatible)
- Voice Analysis (Web Audio API compatible)
- Question Bank with 50+ pre-built questions

## File Structure

```
app/
├── api/
│   ├── auth/                          # Authentication endpoints
│   │   ├── me/route.ts               # Get current user
│   │   ├── logout/route.ts           # User logout
│   │   └── change-password/route.ts  # Password change
│   ├── login/route.ts                # Login endpoint
│   ├── register/route.ts             # Registration endpoint
│   ├── profile/route.ts              # User profile management
│   ├── resume-upload/route.ts        # Resume upload/delete
│   ├── dashboard-stats/route.ts      # Dashboard analytics
│   ├── interview-session/route.ts    # Create interview session
│   ├── interview-results/route.ts    # Store interview results
│   ├── subscriptions/                # Subscription management
│   │   ├── select-plan/route.ts
│   │   └── check/route.ts
│   └── [id]/route.ts                 # Dynamic GET endpoints
├── interview/
│   ├── page.tsx                      # Interview setup
│   ├── session/
│   │   └── [id]/
│   │       ├── page.tsx              # Session overview
│   │       ├── loading/page.tsx      # Pre-interview countdown
│   │       ├── conduct/page.tsx      # Main interview UI
│   │       └── route.ts              # Session GET endpoint
│   └── results/
│       └── [id]/page.tsx             # Results display
├── profile/
│   ├── page.tsx                      # User profile
│   ├── settings/page.tsx             # Account settings
│   └── upgrade/page.tsx              # Pricing/upgrade
├── dashboard/page.tsx                # User dashboard
├── pricing/page.tsx                  # Pricing page
├── login/page.tsx                    # Login page
├── register/page.tsx                 # Registration page
└── layout.tsx                        # Root layout with Toaster

components/
├── navbar.tsx                        # Navigation with auth state
├── footer.tsx                        # Footer
├── pre-interview-setup.tsx          # Interview form component
├── ai-interviewer.tsx               # AI interviewer UI
└── ui/                              # shadcn/ui components

lib/
├── postgres.ts                       # PostgreSQL connection
├── interview-questions.ts            # Question bank utility
└── utils.ts                         # Utility functions

middleware.ts                        # Auth middleware for protected routes

scripts/
├── 01-init-database.sql            # Initial schema
├── 02-add-interview-sessions.sql   # Interview tables
└── 03-add-subscription-system.sql  # Subscription schema
```

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  name VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Interview Sessions Table
```sql
interview_sessions (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  interview_type VARCHAR,
  difficulty VARCHAR,
  job_role VARCHAR,
  experience_years INTEGER,
  tech_stack JSON,
  status VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Interview Results Table
```sql
interview_results (
  id UUID PRIMARY KEY,
  session_id UUID FOREIGN KEY,
  overall_score INTEGER,
  facial_emotion_score INTEGER,
  voice_analysis_score INTEGER,
  content_score INTEGER,
  confidence_level INTEGER,
  emotion_data JSON,
  voice_data JSON,
  feedback TEXT,
  strengths JSON,
  improvements JSON,
  completed_at TIMESTAMP
)
```

### Subscriptions Table
```sql
subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  plan VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
)
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oneself_ai

# JWT Secret
JWT_SECRET=your-secret-key-here

# Resume Upload
UPLOAD_DIR=public/uploads/resumes

# File Storage (Optional)
BLOB_READ_WRITE_TOKEN=your-token
```

## Setup Instructions

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```

3. **Initialize database (optional)**
   ```bash
   npm run db:setup
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

### Production Deployment (Vercel)

1. **Connect to GitHub**
   - Push code to GitHub repository
   - Connect repository to Vercel

2. **Set environment variables**
   - DATABASE_URL
   - JWT_SECRET

3. **Deploy**
   ```bash
   git push origin main
   ```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/resume-upload` - Upload resume
- `DELETE /api/resume-upload` - Delete resume

### Interviews
- `POST /api/interview-session` - Create session
- `GET /api/interview-session/[id]` - Get session details
- `POST /api/interview-results` - Submit interview results
- `GET /api/interview-results/[id]` - Get results

### Dashboard
- `GET /api/dashboard-stats` - Get dashboard statistics

### Subscriptions
- `POST /api/subscriptions/select-plan` - Select plan
- `GET /api/subscriptions/check` - Check current plan

## Key Features Implemented

### ✅ Authentication & Authorization
- JWT-based authentication
- HTTP-only secure cookies
- Protected routes via middleware
- Password hashing with bcrypt

### ✅ User Management
- Registration with email validation
- Login/logout flows
- Profile management
- Password change functionality
- Resume upload/management

### ✅ Subscription System
- Three pricing tiers (Free, Basic, Pro)
- Subscription status checking
- Plan selection

### ✅ Interview System
- Interview setup with 3 types (Technical, Behavioral, Mixed)
- 3 difficulty levels (Easy, Medium, Hard)
- Job role and experience tracking
- Tech stack customization
- Pre-interview countdown
- Session management

### ✅ Results & Analytics
- Score breakdowns (emotion, voice, content, confidence)
- Strengths and improvement areas
- Detailed feedback
- Dashboard with statistics
- Recent interview history

### ✅ UI/UX
- Professional design with purple/blue branding
- Responsive mobile-first design
- Toast notifications
- Loading states
- Error handling
- Accessibility (ARIA labels, semantic HTML)

## Next Phase: AI Integration

Ready for integration:

### Facial Emotion Detection
- Use TensorFlow.js with face-api.js
- Real-time emotion classification
- Confidence scoring
- Emotion timeline tracking

### Voice Analysis
- Use Web Audio API for recording
- Analyze clarity, pace, tone, pronunciation
- Voice quality metrics

### Implementation Points
- `/app/interview/session/[id]/conduct/page.tsx` - Main interview UI
- `lib/interview-questions.ts` - Question bank
- Video stream captured in `videoRef`
- Canvas available for frame capture

## Testing

### Test Credentials
- Email: test@example.com
- Password: Test123456

### Test Interview Flow
1. Register/Login
2. Select pricing plan
3. Create new interview session
4. Complete pre-interview setup
5. View results

## Performance Optimizations

- Image optimization with Next.js Image
- Code splitting and lazy loading
- SWR caching for data fetching
- Compressed video streams
- Optimized database queries

## Security Measures

- HTTPS enforced in production
- CORS properly configured
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS protection with Content Security Policy
- CSRF token validation
- Rate limiting (implement at deployment)

## Monitoring & Logging

- Console logging for development (`[v0]` prefix)
- Error tracking ready for Sentry integration
- Performance monitoring ready for Analytics integration

## Support

For issues or questions:
- Check documentation in this file
- Review API endpoint implementations
- Check console logs for error messages
- Verify environment variables

## License

Proprietary - OneselfAI Platform
