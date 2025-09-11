# RecordRoulette - Clean Start

## Overview
RecordRoulette is a music discovery application that helps users find new music through a roulette-style interface. This is a fresh, clean implementation with systematic architecture.

## Project Structure
**CLEAN SINGLE-ROOT ARCHITECTURE:**
```
project-root/
├── api/           ← Single API location (Vercel serverless functions)
├── src/           ← React frontend source
├── dist/          ← Build output (auto-generated)
├── vite.config.js ← Frontend build configuration
├── vercel.json    ← Deployment configuration
└── package.json   ← Dependencies and scripts
```

## User Preferences
- Preferred communication style: Simple, everyday language
- Wants systematic solutions over trial-and-error debugging
- Building for freelance work (needs reliable deployment process)

## Architecture Decisions
**✅ SYSTEMATIC LESSONS APPLIED:**
1. **Single API Location:** All serverless functions in `/api` (no duplicates)
2. **Clean Configuration:** `vercel.json` at root, Vite config simplified
3. **Replit-Ready:** Vite configured with `allowedHosts: ['*']` for preview
4. **Deployment-Ready:** Clear build process and output directories

## External Dependencies
- **React 18:** Frontend framework
- **Vite 5:** Build tool and dev server
- **Vercel:** Deployment platform for serverless functions

## Deployment Process
1. **Development:** `npm run dev` (Replit preview works)
2. **Production:** Deploy to Vercel with Root Directory = empty (repository root)
3. **No Build Cache:** Always deploy without cache after config changes

## Key Settings
- **Vercel Root Directory:** Empty (repository root)
- **Dev Server:** Port 5000, host 0.0.0.0
- **API Routes:** Work in production only (Vercel serverless)
- **Frontend Routes:** SPA rewrites to index.html