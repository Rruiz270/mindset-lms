# Vercel Deployment Setup

## Required Environment Variables

You need to add these environment variables in your Vercel dashboard:

### 1. Database (Neon - Free Tier)
Go to [neon.tech](https://neon.tech) and create a free account:
1. Create a new project
2. Copy the connection string
3. Add in Vercel as: `DATABASE_URL`

Example format:
```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. NextAuth Configuration
Add these in Vercel:
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=generate-a-random-32-char-string
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

### 3. Optional (for Google Calendar later)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Quick Setup Steps:

1. **Create Neon Database:**
   - Go to https://neon.tech
   - Sign up for free
   - Create project
   - Copy connection string

2. **Configure Vercel:**
   - Go to Vercel dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables above

3. **Redeploy:**
   - Variables will trigger automatic redeployment
   - Or manually redeploy from dashboard

4. **Initialize Database:**
   - Visit: `https://your-app.vercel.app/api/health`
   - This will create demo users automatically

## Demo Credentials (after setup):
- Admin: `admin@mindset.com` / `admin123`
- Student: `student1@mindset.com` / `student123`
- Teacher: `teacher1@mindset.com` / `teacher123`