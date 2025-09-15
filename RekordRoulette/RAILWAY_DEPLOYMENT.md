# Railway Deployment Guide for RekordRoulette

## Quick Setup

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your RekordRoulette repository

2. **Configure Environment Variables**
   Railway will automatically detect and create a PostgreSQL database. You need to add:
   
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SESSION_SECRET=generate_a_random_32_character_string
   BASE_URL=https://your-app-name.up.railway.app
   NODE_ENV=production
   ```

3. **Custom Domain Setup**
   - In Railway dashboard, go to your service settings
   - Click "Domains" tab
   - Add custom domain: `recordroulette.com`
   - Update your DNS records as instructed
   - Update `BASE_URL` environment variable to `https://recordroulette.com`

4. **Spotify OAuth Configuration**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Edit your app settings
   - Add redirect URI: `https://recordroulette.com/auth/spotify/callback`

## Build Process

Railway will automatically:
- Install dependencies with `npm install`
- Build the frontend and backend with `npm run build`
- Start the server with `npm start`

## Database

Railway provides a managed PostgreSQL database that's automatically connected to your app via the `DATABASE_URL` environment variable.

## Port Configuration

The app is configured to use Railway's dynamic `PORT` environment variable, defaulting to 5000 for local development.