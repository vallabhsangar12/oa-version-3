# Local Development Setup

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL (locally installed or Docker)
- MongoDB (locally installed or Docker)

## 1. PostgreSQL Setup

### Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Create the Database

```bash
psql -U postgres
```

```sql
CREATE DATABASE oa_db;
CREATE USER oa_user WITH PASSWORD 'oa_password';
GRANT ALL PRIVILEGES ON DATABASE oa_db TO oa_user;
\c oa_db
GRANT ALL ON SCHEMA public TO oa_user;
```

### Run the Schema Migration

```bash
psql -U oa_user -d oa_db -f scripts/01-init-database.sql
```

This creates all required tables: `users`, `password_reset_tokens`, `resumes`, `contact_submissions`, `pre_interview_setup`, `interview_sessions`, `interview_results`, `performance_reports`.

## 2. MongoDB Setup

### Install MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
Follow https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

**Windows:**
Download from https://www.mongodb.com/try/download/community

MongoDB will automatically create the `oa_logs` database and collections on first write.

## 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local values:

```
POSTGRES_URL=postgresql://oa_user:oa_password@localhost:5432/oa_db
MONGODB_URI=mongodb://localhost:27017/oa_logs
JWT_SECRET=your_random_secret_key_here
UPLOAD_DIR=./uploads
NODE_ENV=development
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Upload Folder

The upload folder is created automatically when a resume is uploaded. If you want to create it manually:

```bash
mkdir -p uploads/resumes
```

Add `uploads/` to your `.gitignore` if not already present.

## 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000.

## Architecture Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| PostgreSQL | `pg` library | Users, auth, resumes, interviews, performance, contacts |
| MongoDB | `mongodb` driver | Interview logs, emotion batches, sentiment logs, voice logs, debug logs |
| File Storage | Local filesystem | Resume PDFs saved to `uploads/resumes/` |

## API Routes

### Authentication
- `POST /api/register` - Create a new account
- `POST /api/login` - Sign in (sets httpOnly cookie)
- `POST /api/auth/logout` - Sign out (clears cookie)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Interview
- `POST /api/interviews` - Save interview session
- `GET /api/interviews?userId=` - Get user interviews
- `POST /api/interview/start` - Start interview
- `POST /api/interview/end` - End interview and compute score
- `POST /api/interview-score` - Compute interview confidence score
- `POST /api/pre-interview-setup` - Save pre-interview configuration

### Analysis
- `POST /api/emotion` - Emotion detection
- `POST /api/text-sentiment` - Text sentiment analysis
- `POST /api/voice-emotion` - Voice emotion analysis

### Other
- `POST /api/resume-upload` - Upload resume PDF
- `POST /api/contact` - Submit contact form
- `POST /api/performance` - Save performance report
- `GET /api/performance?sessionId=` - Get performance report

## Troubleshooting

**PostgreSQL connection refused:**
Ensure PostgreSQL is running and the connection string in `.env.local` is correct.

**MongoDB connection refused:**
Ensure MongoDB is running on port 27017 (default).

**Upload errors:**
Ensure the `uploads/` directory is writable by the Node.js process. Only PDF files under 5MB are accepted.

**Password reset link not appearing:**
In development mode, the reset link is printed to the terminal console output. Check your `npm run dev` terminal.
