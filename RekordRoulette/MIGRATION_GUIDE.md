# 🚀 RecordRoulette: FREE Hosting Migration Guide

## ⚡ **EMERGENCY MIGRATION: REPLIT → VERCEL + SUPABASE**

Your database is down and costs are mounting. This guide will get you to **$0/month hosting** in 2-3 hours.

---

## 📋 **Pre-Migration Checklist**

✅ Save/export all your current user data  
✅ Note your Spotify app credentials  
✅ Backup your .env file  
✅ Download this project as ZIP (backup)  

---

## 🎯 **STEP 1: Set Up Free Database (Supabase)**

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub (free)
3. Create new project: "recordroulette"
4. Choose region closest to your users
5. Set strong database password

### 1.2 Get Database Connection
1. In Supabase dashboard → Settings → Database
2. Copy **Connection string** (PostgreSQL)
3. Save for later: `postgresql://postgres:password@host:5432/postgres`

### 1.3 Migrate Your Schema
1. In Supabase → SQL Editor
2. Copy your entire `shared/schema.ts` structure
3. Convert to SQL and run in Supabase
4. **OR** Use the schema migration below ⬇️

---

## 🗄️ **STEP 2: Database Schema for Supabase**

```sql
-- Run this in Supabase SQL Editor
-- RecordRoulette Complete Schema

-- Users table
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'spotify',
  provider_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires TIMESTAMP,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  premium_tier TEXT DEFAULT 'free',
  referral_code TEXT UNIQUE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  custom_theme TEXT,
  is_verified_curator BOOLEAN NOT NULL DEFAULT false,
  daily_spin_limit INTEGER NOT NULL DEFAULT 5,
  keyboard_shortcuts BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Albums table
CREATE TABLE albums (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'spotify',
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  year INTEGER,
  cover_url TEXT,
  preview_url TEXT,
  genres JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Spins table
CREATE TABLE spins (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  mode TEXT NOT NULL DEFAULT 'personal',
  seed TEXT,
  album_id TEXT NOT NULL REFERENCES albums(id),
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  listened_at TIMESTAMP,
  share_image TEXT
);

-- Continue with other tables as needed...
-- (Add the rest of your schema from shared/schema.ts)
```

---

## 🔧 **STEP 3: Prepare Your Code**

### 3.1 Update Package.json
Replace your `package.json` with the provided `package-vercel.json`:
```bash
mv package.json package-replit.json
mv package-vercel.json package.json
```

### 3.2 Update Vite Config
Replace your `vite.config.ts` with the provided `vite-vercel.config.ts`:
```bash
mv vite.config.ts vite-replit.config.ts  
mv vite-vercel.config.ts vite.config.ts
```

### 3.3 Install New Dependencies
```bash
npm install @supabase/supabase-js postgres
npm uninstall @neondatabase/serverless connect-pg-simple express express-session
```

---

## 🚀 **STEP 4: Deploy to Vercel**

### 4.1 Create GitHub Repository
1. Create new repo: "recordroulette"
2. Upload your entire project
3. Ensure all new files are included:
   - `vercel.json`
   - `api/` folder with functions
   - `lib/supabase.ts`

### 4.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) 
2. Import from GitHub
3. Select your "recordroulette" repo
4. Framework: "Vite"
5. Deploy!

### 4.3 Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL = your_supabase_connection_string
SPOTIFY_CLIENT_ID = your_spotify_client_id  
SPOTIFY_CLIENT_SECRET = your_spotify_client_secret
SPOTIFY_REDIRECT_URI = https://your-app.vercel.app/api/auth/spotify/callback
NODE_ENV = production
```

---

## 🎵 **STEP 5: Update Spotify App**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Edit your RecordRoulette app
3. Update Redirect URIs:
   - Remove: `https://...replit.dev/auth/spotify/callback`
   - Add: `https://your-app.vercel.app/api/auth/spotify/callback`
4. Save changes

---

## ✅ **STEP 6: Test Everything**

### 6.1 Basic Tests
- ✅ Site loads: `https://your-app.vercel.app`
- ✅ Spotify login works
- ✅ Music discovery functions
- ✅ Database saves user data
- ✅ PWA install prompt appears

### 6.2 Advanced Tests  
- ✅ Offline functionality works
- ✅ All discovery modes function
- ✅ Analytics and premium features work
- ✅ Social features and referrals work

---

## 💰 **RESULT: $0/MONTH HOSTING**

### Before (Replit):
- ❌ Core Plan: $25/month
- ❌ Database: $5-10/month  
- ❌ Hosting: $3-10/month
- **Total: $33-45/month** 💸

### After (Vercel + Supabase):
- ✅ Vercel hosting: **FREE**
- ✅ Supabase database: **FREE** (500MB)
- ✅ Domain: $12/year (optional)
- **Total: $0-1/month** 🎉

---

## 🆘 **Troubleshooting**

### Common Issues:

**Build Fails**
- Check all imports use `.js` extensions for API routes
- Ensure all environment variables are set

**Database Connection Fails**  
- Verify DATABASE_URL format
- Check Supabase project is active

**Spotify Auth Fails**
- Confirm redirect URI is exact match
- Check client ID/secret are correct

**API Routes 404**
- Verify `vercel.json` configuration
- Check API folder structure

---

## 🎯 **Next Steps After Migration**

1. **Monitor Usage**: Watch Vercel/Supabase dashboards
2. **Scale Up**: Both have generous free tiers
3. **Custom Domain**: Add your own domain for $12/year
4. **Backup**: Set up automated database backups

---

## 🚨 **URGENT: Do This TODAY**

Your Neon database is already disabled, costing you users and money. This migration:

✅ **Saves $400+/year in hosting costs**  
✅ **Provides more reliable hosting**  
✅ **Includes better global CDN**  
✅ **Maintains all your features**  

**Start now - your budget depends on it!**