# Local Setup Guide - OneselfAI Platform

This guide will help you set up and run the OneselfAI platform on your local machine.

## Prerequisites

- Node.js 16+ (recommended 18 LTS)
- npm or yarn
- PostgreSQL 12+
- Git

## Step 1: Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

## Step 2: Create Database and User

```bash
# Connect to PostgreSQL
psql postgres

# In psql terminal:
CREATE USER oneselfai WITH PASSWORD 'oneselfai_dev_password';
CREATE DATABASE oneselfai_dev OWNER oneselfai;

# Enable required extensions
\c oneselfai_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Exit psql
\q
```

## Step 3: Clone and Setup Project

```bash
# Clone the repository
git clone <repo-url>
cd oa-version-3.2

# Install dependencies
npm install
```

## Step 4: Configure Environment Variables

Create `.env.local` file in project root:

```env
# Database
POSTGRES_URL="postgresql://oneselfai:oneselfai_dev_password@localhost:5432/oneselfai_dev"

# JWT Secret (generate a random string for production)
JWT_SECRET="dev_secret_key_change_in_production_12345"

# Node environment
NODE_ENV="development"

# Optional: MongoDB (if using)
MONGODB_URI="mongodb://localhost:27017/oneselfai"
```

## Step 5: Run Database Migrations

```bash
# Using psql directly
psql postgresql://oneselfai:oneselfai_dev_password@localhost:5432/oneselfai_dev < scripts/00-create-schema.sql

# Or connect and run manually
psql -U oneselfai -d oneselfai_dev -f scripts/00-create-schema.sql
```

Verify tables were created:
```bash
psql -U oneselfai -d oneselfai_dev
\dt  # List all tables

# You should see:
# - users
# - subscriptions
# - resumes
# - interview_sessions
# - interview_results
# - password_reset_tokens
```

## Step 6: Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Step 7: Test the Application

### Create Account
1. Visit http://localhost:3000
2. Click "Sign In" button
3. Click "Register" link
4. Fill in: Name, Email, Password
5. Submit

### Login
1. Use email and password from registration
2. Should redirect to home page with "Login successful" toast

### Access Dashboard
1. Click "Dashboard" in navbar
2. Should show empty state with stats
3. Can start interview setup

### Test Protected Routes
- `/dashboard` - Should redirect to /login if not authenticated
- `/profile` - Should redirect to /login if not authenticated
- `/interview` - Should redirect to /login if not authenticated

## Common Issues and Fixes

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
1. Check if PostgreSQL is running: `brew services list` (macOS)
2. Start PostgreSQL: `brew services start postgresql`
3. Verify connection: `psql postgres`

### JWT_SECRET Not Set
```
Error: JWT_SECRET environment variable is required
```
**Solution:**
1. Add `JWT_SECRET` to `.env.local`
2. Restart dev server: `npm run dev`

### Database User Already Exists
```
Error: role "oneselfai" already exists
```
**Solution:**
```bash
# Drop existing user and database
psql postgres
DROP DATABASE IF EXISTS oneselfai_dev;
DROP USER IF EXISTS oneselfai;
# Then run Step 2 again
```

### Port 3000 Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or run on different port
npm run dev -- -p 3001
```

### Module Not Found Errors
```
Error: Cannot find module '@/lib/auth'
```
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## Verification Checklist

After setup, verify these work:

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads home page
- [ ] Can register new account
- [ ] Can login with created account
- [ ] Dashboard loads with 0 interviews stat
- [ ] Profile page accessible
- [ ] Can logout (redirects to home)
- [ ] Protected routes redirect to /login when not authenticated
- [ ] No 500 errors in console

## Database Administration

### Connect to Database
```bash
psql -U oneselfai -d oneselfai_dev
```

### View All Tables
```bash
\dt
```

### View Users
```bash
SELECT id, email, name, created_at FROM users;
```

### Delete All Data (Fresh Start)
```bash
TRUNCATE TABLE interview_results CASCADE;
TRUNCATE TABLE interview_sessions CASCADE;
TRUNCATE TABLE password_reset_tokens CASCADE;
TRUNCATE TABLE subscriptions CASCADE;
TRUNCATE TABLE resumes CASCADE;
TRUNCATE TABLE users CASCADE;
```

### Drop and Recreate Database
```bash
DROP DATABASE oneselfai_dev;
CREATE DATABASE oneselfai_dev OWNER oneselfai;
\c oneselfai_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q

# Then re-run migrations
psql -U oneselfai -d oneselfai_dev -f scripts/00-create-schema.sql
```

## Development Workflow

1. Make changes to code
2. Server auto-reloads (hot reload enabled)
3. Check browser console for errors
4. Check terminal for server logs

## Debugging

Enable debug logging by adding to `.env.local`:
```env
DEBUG=*
```

Check logs in:
- Browser console (Ctrl+F12 or Cmd+Option+I)
- Terminal where `npm run dev` is running

## Troubleshooting

If you encounter issues:

1. Check `.env.local` is configured correctly
2. Verify PostgreSQL is running and database exists
3. Clear browser cache and cookies
4. Restart dev server
5. Check that Node.js version is 16+

For additional help, check `DEVELOPER_GUIDE.md` for advanced topics.
