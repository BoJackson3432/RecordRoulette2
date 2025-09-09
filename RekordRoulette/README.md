# 🎵 RecordRoulette

## About
RecordRoulette is an intelligent music discovery web application that gamifies album listening through a vinyl roulette experience with Spotify integration.

## 🚀 Hosting Architecture

**Development:** Replit  
**Production:** Vercel + Supabase  
**Workflow:** Replit → GitHub → Vercel (auto-deploy)

## 🛠️ Development Setup

### Local Development (Replit)
```bash
npm install
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` and fill in your values:
- `SPOTIFY_CLIENT_ID` - Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Your Spotify app client secret  
- `DATABASE_URL` - PostgreSQL connection string
- `SPOTIFY_REDIRECT_URI` - OAuth redirect URL

## 📦 Deployment

### Automatic Deployment
1. Make changes in Replit
2. Commit and push to GitHub
3. Vercel automatically deploys

### Manual Deployment
```bash
git add .
git commit -m "Your changes"
git push origin main
```

## 🔧 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Auth:** Spotify OAuth 2.0
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion

## 🎯 Features

- 🎲 6 Discovery modes (Personal, Recommendations, New Artists, etc.)
- 🏆 Trophy system and achievements
- 📱 PWA support with offline functionality
- 🔄 Referral system and social features
- 📊 Advanced analytics and listening insights
- 💎 Premium tiers and advanced features

## 💰 Cost Optimization

**Before:** $35/month (Replit + Neon)  
**After:** $0/month (Vercel + Supabase)  
**Savings:** $420/year# RecordRoulette2
