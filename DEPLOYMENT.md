# Deployment Guide for Mindset LMS

## Vercel Deployment Steps

### 1. Database Setup
You'll need a PostgreSQL database. Recommended options:
- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com

### 2. Vercel Environment Variables

Go to your Vercel project settings and add these environment variables:

**Required:**
```
DATABASE_URL=your-postgresql-connection-string
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=a-random-secret-key-at-least-32-chars
```

**Optional (for future features):**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Database Setup Commands

After deployment, you'll need to set up your database:

```bash
# If you have Vercel CLI installed locally:
vercel env pull .env.local
npm run db:push
npm run db:seed
```

Or use the Vercel dashboard to run these commands in a serverless function.

### 4. Quick Database Setup Options

**Option A: Neon (Recommended for free tier)**
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Add it as DATABASE_URL in Vercel

**Option B: Supabase**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add it as DATABASE_URL in Vercel

### 5. NEXTAUTH_SECRET Generation

Generate a secure secret:
```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32
```

### 6. After Deployment

Once deployed, you can access:
- **App**: https://your-app-name.vercel.app
- **Demo Login**: Use the accounts from the seed data

**Demo Accounts:**
- Student: `student1@mindset.com` / `student123`
- Teacher: `teacher1@mindset.com` / `teacher123`
- Admin: `admin@mindset.com` / `admin123`

### 7. Domain Setup (Optional)

In Vercel dashboard:
1. Go to your project
2. Settings > Domains
3. Add your custom domain (e.g., lms.mindset.com)
4. Update NEXTAUTH_URL to your custom domain

## Troubleshooting

**Database Connection Issues:**
- Ensure DATABASE_URL includes all connection parameters
- Check if your database allows external connections
- Verify the connection string format

**Authentication Issues:**
- Make sure NEXTAUTH_URL matches your deployed URL exactly
- NEXTAUTH_SECRET should be at least 32 characters
- Check that the auth pages are accessible

**Build Issues:**
- The build includes `db:generate` to ensure Prisma client is ready
- If build fails, check the Vercel build logs

## Production Checklist

- [ ] Database created and accessible
- [ ] Environment variables set in Vercel
- [ ] Database schema pushed (`db:push`)
- [ ] Seed data loaded (`db:seed`)  
- [ ] Custom domain configured (if desired)
- [ ] SSL certificate active
- [ ] Demo accounts working