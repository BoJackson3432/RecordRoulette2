# RecordRoulette

## Overview

RecordRoulette is an intelligent music discovery web application that gamifies album listening through a vinyl roulette experience. Users authenticate with Spotify and choose from six discovery modes including saved music, personalized recommendations, new artist discovery, random albums, mood-based discovery, and time-based suggestions. The app analyzes listening history and preferences to provide tailored album discoveries, tracks listening streaks, and generates shareable PNG images of musical discoveries. The application encourages full-album listening by creating an engaging, game-like experience around personalized music discovery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Animations**: Framer Motion for smooth transitions and interactive vinyl spinning animations
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Design System**: Modern dark theme with custom CSS variables and Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints following conventional HTTP methods
- **Error Handling**: Centralized error middleware with structured JSON responses
- **Development**: Hot reload and middleware logging for development experience

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema Management**: Drizzle migrations with schema defined in shared TypeScript files
- **Key Entities**:
  - Users (authentication and profile data)
  - Albums (Spotify metadata cache)
  - Spins (user interaction history)
  - Streaks (gamification metrics)

### Authentication & Authorization
- **OAuth Provider**: Spotify OAuth 2.0 Authorization Code Flow
- **Token Management**: Automatic access token refresh with secure server-side storage
- **Session Security**: HTTP-only cookies with CSRF protection and secure flags
- **User Persistence**: Automatic user creation and profile synchronization

### External Dependencies
- **Music Service**: Spotify Web API with enhanced scopes for:
  - User library access and album metadata
  - Listening history and recently played tracks
  - Top artists and tracks analysis
  - Music recommendations and related artists discovery
- **Image Generation**: Satori for server-side React component to PNG conversion using @resvg/resvg-js
- **Database Hosting**: Neon serverless PostgreSQL for managed database infrastructure
- **Development Tools**: 
  - Replit-specific plugins for development environment integration
  - WebSocket polyfill for Neon database connections
  - Development banner and cartographer for debugging

### Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: End-to-end TypeScript with shared interfaces and validation
- **Repository Pattern**: Database abstraction layer with interface-based storage operations
- **Service Layer**: Dedicated services for complex operations like image generation
- **Component Composition**: Reusable UI components following atomic design principles

## Recent Changes

**September 8, 2025**: Viral Social Features Implementation
- Adding Instagram Stories integration with custom branded templates
- Implementing shareable achievement cards for discovery milestones
- Creating viral-optimized copy links and social sharing features
- Building competitive leaderboards and social discovery features
- Optimizing for cross-platform viral growth on Instagram/TikTok

**September 7, 2025**: Enhanced Music Discovery
- Added intelligent discovery modes beyond saved albums
- Implemented personalized recommendations based on listening history
- Added similar artist discovery and recent listening analysis
- Updated Spotify OAuth scopes for enhanced data access
- Enhanced frontend with discovery mode selector interface
- Improved album recommendation algorithms using user preference data