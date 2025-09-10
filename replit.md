# RecordRoulette

## Overview

RecordRoulette is an intelligent music discovery web application that gamifies album listening through a vinyl roulette experience with Spotify integration. Users authenticate with Spotify OAuth and choose from six discovery modes to get curated daily album recommendations. The application emphasizes full album listening over playlist shuffling, featuring achievement systems, streak tracking, and social sharing capabilities to encourage deeper musical exploration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for build tooling and hot reload
- **Routing**: Client-side routing with Wouter for lightweight navigation
- **Styling**: Tailwind CSS with shadcn/ui component library and custom CSS variables for theming
- **Animations**: Framer Motion for smooth transitions, vinyl spinning effects, and achievement celebrations
- **State Management**: TanStack Query (React Query) for server state caching and synchronization
- **PWA Features**: Service worker implementation with offline capabilities and install prompts

### Backend Architecture
- **Development Environment**: Express.js server with TypeScript and ES modules
- **Production Environment**: Vercel serverless functions for scalability
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Authentication**: Spotify OAuth 2.0 Authorization Code Flow with automatic token refresh
- **API Design**: RESTful endpoints with structured JSON responses and error handling
- **Image Generation**: Satori and resvg-js for server-side social sharing image creation

### Database Design
- **ORM**: Drizzle ORM for type-safe PostgreSQL operations and schema management
- **Development**: Neon serverless PostgreSQL with connection pooling
- **Production**: Supabase PostgreSQL for hosted database solution
- **Schema Structure**:
  - Users table with Spotify integration and premium tier support
  - Albums table for metadata caching with genre and preview URL storage
  - Spins table tracking user discovery sessions and listening completion
  - Streaks table for gamification metrics and achievement tracking
  - Trophies system for Minecraft-inspired achievements

### Discovery Modes & Gamification
- **Six Discovery Modes**: Personal library, AI recommendations, new artists, genre exploration, decade deep-dives, and complete randomization
- **Achievement System**: 30+ Minecraft-inspired trophies with bronze/silver/gold/diamond tiers
- **Streak Mechanics**: Daily listening streaks with celebration animations and social sharing
- **Weekly Analytics**: Comprehensive listening insights and progress tracking

## External Dependencies

- **Spotify Web API**: Primary music service integration with comprehensive scopes for user library access, playback control, and recommendation algorithms
- **Deployment Platforms**: 
  - Development hosted on Replit with live preview capabilities
  - Production deployment via Vercel with automatic GitHub integration
- **Database Solutions**:
  - Development using Neon serverless PostgreSQL 
  - Production migration to Supabase for cost optimization and scalability
- **Social Features**: Native Web Share API integration for cross-platform sharing capabilities
- **Image Processing**: Server-side social media image generation using Satori for JSX-to-SVG conversion and resvg-js for PNG output