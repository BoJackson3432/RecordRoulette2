import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { spotifyAuth, handleSpotifyLogin, handleSpotifyCallback } from "./auth/spotify";
import { generateShareImage } from "./services/image";
import { trophyService } from "./services/trophyService";
import { weeklyStatsService } from "./services/weeklyStatsService";
import { analyticsService } from "./services/analyticsService";
import { db } from "./db";
import { trophies, userTrophies, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import axios from "axios";
import { 
  getUserReferralCode, 
  getReferralStats, 
  shareReferral, 
  processReferralSignup 
} from "./referrals";
import {
  getMoods,
  getUserMoodPreferences,
  discoverByMood,
  discoverByTime
} from "./services/moodDiscovery";
import {
  getLeaderboards,
  getUserRanking,
  shareCompetitionResult
} from "./services/leaderboard";
import {
  getPremiumStatus,
  getAdvancedAnalytics,
  upgradePremium,
  updatePremiumSettings
} from "./services/premiumService";
import {
  getAnalyticsDashboard,
  trackBehaviorEvent,
  createSession,
  endSession
} from "./services/analytics";
import {
  findFriends,
  createChallenge,
  getChallenges,
  joinChallenge,
  getPersonalizedRecommendations
} from "./services/collaborative";

// Session configuration
declare module "express-session" {
  interface SessionData {
    userId?: string;
    oauthState?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add CORS headers for production
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Serve PWA files with correct MIME types
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
  });
  
  app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
  });

  // Initialize PostgreSQL session store
  const PostgreSqlStore = connectPgSimple(session);
  
  // Session middleware with PostgreSQL store
  app.use(session({
    store: new PostgreSqlStore({
      conString: process.env.DATABASE_URL,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      httpOnly: true, 
      sameSite: "lax", 
      secure: false, // Fixed: disable secure cookies for now
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Auth routes
  app.get("/auth/spotify/login", handleSpotifyLogin);
  app.get("/auth/spotify/callback", handleSpotifyCallback);

  app.get("/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUserWithStreak(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        onboardingCompleted: user.onboardingCompleted,
        streak: user.streak || { current: 0, longest: 0 },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Mark onboarding as completed
  app.post('/api/me/onboarding', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Update user onboarding status
      await db.update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.id, req.session.userId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  });

  // Referral System Routes
  app.get('/api/referrals/code', (req, res) => {
    // Add user to req for TypeScript compatibility
    (req as any).user = { id: req.session.userId };
    getUserReferralCode(req as any, res);
  });

  app.get('/api/referrals/stats', (req, res) => {
    // Add user to req for TypeScript compatibility
    (req as any).user = { id: req.session.userId };
    getReferralStats(req as any, res);
  });

  app.post('/api/referrals/share', (req, res) => {
    // Add user to req for TypeScript compatibility
    (req as any).user = { id: req.session.userId };
    shareReferral(req as any, res);
  });

  // Mood Discovery Routes
  app.get('/api/moods', getMoods);
  
  app.get('/api/moods/preferences', getUserMoodPreferences);
  
  app.get('/api/discover/mood/:moodId', discoverByMood);
  
  app.get('/api/discover/time/:timeContext', discoverByTime);

  // Leaderboard and Competition Routes
  app.get('/api/leaderboards', getLeaderboards);
  
  app.get('/api/leaderboards/ranking', getUserRanking);
  
  app.post('/api/leaderboards/share', shareCompetitionResult);

  // Premium Features Routes
  app.get('/api/premium/status', getPremiumStatus);
  
  app.get('/api/premium/analytics', getAdvancedAnalytics);
  
  app.post('/api/premium/upgrade', upgradePremium);
  
  app.put('/api/premium/settings', updatePremiumSettings);

  // Analytics and Behavior Tracking Routes
  app.get('/api/analytics/dashboard', getAnalyticsDashboard);
  
  app.post('/api/analytics/events', trackBehaviorEvent);
  
  app.post('/api/analytics/session', createSession);
  
  app.post('/api/analytics/session/end', endSession);

  // Collaborative Features Routes
  app.get('/api/friends/discover', findFriends);
  
  app.post('/api/challenges/create', createChallenge);
  
  app.get('/api/challenges', getChallenges);
  
  app.post('/api/challenges/:challengeId/join', joinChallenge);
  
  app.get('/api/recommendations/personalized', getPersonalizedRecommendations);

  // Check if user can spin today
  app.get("/api/spin/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // TEMPORARILY DISABLED: Get user's last spin today
      // const today = new Date();
      // today.setHours(0, 0, 0, 0);
      // 
      // const todaySpins = await storage.getSpinsByUserSince(req.session.userId, today);
      // 
      // if (todaySpins.length > 0) {
      //   const lastSpin = todaySpins[0];
      //   const nextSpinTime = new Date(lastSpin.startedAt);
      //   nextSpinTime.setHours(nextSpinTime.getHours() + 24);
      //   
      //   res.json({
      //     canSpin: false,
      //     nextSpinTime: nextSpinTime.toISOString(),
      //     lastSpin: {
      //       id: lastSpin.id,
      //       album: lastSpin.album,
      //       startedAt: lastSpin.startedAt,
      //     }
      //   });
      // } else {
        res.json({
          canSpin: true,
          nextSpinTime: null,
          lastSpin: null
        });
      // }
    } catch (error) {
      console.error("Spin status error:", error);
      res.status(500).json({ error: "Failed to check spin status" });
    }
  });

  // Get spin history
  app.get("/api/spins/history", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const spins = await storage.getSpinsByUser(req.session.userId, 50); // Get last 50 spins
      res.json(spins);
    } catch (error) {
      console.error("Failed to get spin history:", error);
      res.status(500).json({ error: "Failed to get spin history" });
    }
  });

  // Favorites API endpoints
  // Get user's favorite albums
  app.get("/api/favorites", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const favorites = await storage.getFavoritesByUser(req.session.userId);
      res.json(favorites);
    } catch (error) {
      console.error("Failed to get favorites:", error);
      res.status(500).json({ error: "Failed to get favorites" });
    }
  });

  // Batch check favorite status for multiple albums (MUST come before :albumId route)
  app.post("/api/favorites/batch-status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { albumIds } = req.body;
      if (!Array.isArray(albumIds)) {
        return res.status(400).json({ error: "albumIds must be an array" });
      }

      const favoriteStatuses = await storage.batchCheckFavorites(req.session.userId, albumIds);
      res.json(favoriteStatuses);
    } catch (error) {
      console.error("Failed to batch check favorite status:", error);
      res.status(500).json({ error: "Failed to batch check favorite status" });
    }
  });

  // Add album to favorites
  app.post("/api/favorites/:albumId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { albumId } = req.params;
      
      // Check if already favorite
      const isAlreadyFavorite = await storage.isFavorite(req.session.userId, albumId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ error: "Album already in favorites" });
      }

      const favorite = await storage.addFavorite(req.session.userId, albumId);
      res.json({ success: true, favorite });
    } catch (error) {
      console.error("Failed to add favorite:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  // Remove album from favorites
  app.delete("/api/favorites/:albumId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { albumId } = req.params;
      await storage.removeFavorite(req.session.userId, albumId);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Check if album is favorite
  app.get("/api/favorites/:albumId/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { albumId } = req.params;
      const isFavorite = await storage.isFavorite(req.session.userId, albumId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Failed to check favorite status:", error);
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  // Play album on Spotify
  app.post("/api/spotify/play/:albumId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { albumId } = req.params;
      const accessToken = await spotifyAuth.getValidAccessToken(req.session.userId);
      
      try {
        // Try to start playback through API first
        await spotifyAuth.startAlbumPlayback(accessToken, albumId);
        res.json({ 
          success: true,
          message: "Playback started successfully",
          playbackMethod: "api"
        });
      } catch (playbackError: any) {
        // If API playback fails, provide fallback URL
        console.log("API playback failed, providing fallback:", playbackError.message);
        
        res.json({
          success: false,
          requiresDevice: playbackError.message.includes("No active Spotify device"),
          spotifyUrl: `https://open.spotify.com/album/${albumId}`,
          message: playbackError.message,
          playbackMethod: "url"
        });
      }
    } catch (error: any) {
      console.error("Failed to handle Spotify playback:", error);
      res.status(500).json({ 
        error: error.message || "Failed to handle playback request",
        details: error.message
      });
    }
  });

  // Check if user can spin today
  // Album preview route (doesn't count as a spin)
  app.get("/api/album/preview", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const accessToken = await spotifyAuth.getValidAccessToken(req.session.userId);
      const mode = (req.query.mode as string) || "personal";

      // Get album based on discovery mode (same logic as spin but don't create spin record)
      let selectedAlbums: any[] = [];

      switch (mode) {
        case "personal":
          selectedAlbums = await spotifyAuth.getUserSavedAlbums(accessToken, 50, 0);
          break;
        case "recommendations":
          selectedAlbums = await spotifyAuth.searchRandomPopularAlbums(accessToken, 50);
          break;
        case "new-artists":
          selectedAlbums = await spotifyAuth.searchRandomPopularAlbums(accessToken, 50);
          break;
        case "similar":
          const similar = await spotifyAuth.getArtistAlbums(accessToken, "4Z8W4fKeB5YxbusRsdQVPb"); // Default to some artist
          selectedAlbums = similar;
          break;
        case "roulette":
          selectedAlbums = await spotifyAuth.searchRandomPopularAlbums(accessToken, 50);
          break;
        default:
          return res.status(400).json({ error: "Invalid discovery mode" });
      }

      if (selectedAlbums.length === 0) {
        return res.status(404).json({ error: "No albums found for preview" });
      }

      // Pick random album for preview
      const randomAlbum = selectedAlbums[Math.floor(Math.random() * selectedAlbums.length)];

      // Get preview URL
      let previewUrl = null;
      try {
        const tracksResponse = await spotifyAuth.getAlbumTracks(accessToken, randomAlbum.id);
        const trackWithPreview = tracksResponse.find((track: any) => track.preview_url);
        previewUrl = trackWithPreview?.preview_url || null;
      } catch (error) {
        console.log("Could not fetch preview for album:", randomAlbum.id);
      }

      const albumPreview = {
        id: randomAlbum.id,
        name: randomAlbum.name,
        artist: randomAlbum.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist",
        year: randomAlbum.release_date ? parseInt(randomAlbum.release_date.slice(0, 4)) : null,
        coverUrl: randomAlbum.images?.[0]?.url || null,
        previewUrl,
        genres: []
      };

      res.json({ 
        album: albumPreview,
        mode
      });
    } catch (error: any) {
      console.error("Preview error:", error);
      res.status(500).json({ error: "Failed to get album preview" });
    }
  });

  // Commit to album after preview (this creates the actual spin)
  app.post("/api/album/commit", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { albumId, mode } = req.body;
      if (!albumId || !mode) {
        return res.status(400).json({ error: "Album ID and mode required" });
      }

      // Daily limit temporarily disabled
      // const userSpins = await storage.getSpinsByUser(req.session.userId);
      // const today = new Date();
      // today.setHours(0, 0, 0, 0);
      // const todaySpins = userSpins.filter(spin => {
      //   const spinDate = new Date(spin.startedAt);
      //   spinDate.setHours(0, 0, 0, 0);
      //   return spinDate.getTime() === today.getTime();
      // });
      // 
      // if (todaySpins.length > 0) {
      //   return res.status(429).json({ error: "Daily limit reached. Come back tomorrow!" });
      // }

      const accessToken = await spotifyAuth.getValidAccessToken(req.session.userId);

      // Get album details if not in database
      let album = await storage.getAlbum(albumId);
      if (!album) {
        // Fetch from Spotify and store
        const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const spotifyAlbum = albumResponse.data;
        let previewUrl = null;
        try {
          const tracksResponse = await spotifyAuth.getAlbumTracks(accessToken, spotifyAlbum.id);
          const trackWithPreview = tracksResponse.find((track: any) => track.preview_url);
          previewUrl = trackWithPreview?.preview_url || null;
        } catch (error) {
          console.log("Could not fetch preview for album:", spotifyAlbum.id);
        }

        const albumData = {
          id: spotifyAlbum.id,
          name: spotifyAlbum.name,
          artist: spotifyAlbum.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist",
          year: spotifyAlbum.release_date ? parseInt(spotifyAlbum.release_date.slice(0, 4)) : null,
          coverUrl: spotifyAlbum.images?.[0]?.url || null,
          previewUrl,
          genres: []
        };

        album = await storage.upsertAlbum(albumData);
      }

      // Create spin record
      const spin = await storage.createSpin({
        userId: req.session.userId,
        mode,
        albumId: album.id,
        seed: mode === "roulette" ? "random_preview" : mode,
      });

      res.json({ 
        success: true,
        spin: {
          id: spin.id,
          album,
          mode,
          startedAt: spin.startedAt
        }
      });

    } catch (error: any) {
      console.error("Commit error:", error);
      res.status(500).json({ error: "Failed to commit to album" });
    }
  });

  app.get("/api/spin/can-spin", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const userWithStreak = await storage.getUserWithStreak(req.session.userId);
      const streak = userWithStreak?.streak;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (streak?.lastSpinDate) {
        const lastSpinDate = new Date(streak.lastSpinDate);
        const lastSpinDay = new Date(lastSpinDate.getFullYear(), lastSpinDate.getMonth(), lastSpinDate.getDate());
        
        if (lastSpinDay.getTime() === today.getTime()) {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const timeUntilNext = tomorrow.getTime() - now.getTime();
          
          return res.json({
            canSpin: false,
            reason: "daily_limit_reached",
            nextSpinAvailable: tomorrow.toISOString(),
            timeUntilNext: Math.ceil(timeUntilNext / 1000), // seconds
            message: "You can spin again tomorrow!"
          });
        }
      }
      
      res.json({
        canSpin: true,
        reason: "available",
        nextSpinAvailable: null,
        timeUntilNext: 0
      });
      
    } catch (error) {
      console.error("Error checking spin availability:", error);
      res.status(500).json({ error: "Failed to check spin availability" });
    }
  });

  // Spin routes
  app.post("/api/spin", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Daily limit using streak data temporarily disabled
      // const userWithStreak = await storage.getUserWithStreak(req.session.userId);
      // const streak = userWithStreak?.streak;
      // const now = new Date();
      // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // 
      // if (streak?.lastSpinDate) {
      //   const lastSpinDate = new Date(streak.lastSpinDate);
      //   const lastSpinDay = new Date(lastSpinDate.getFullYear(), lastSpinDate.getMonth(), lastSpinDate.getDate());
      //   
      //   if (lastSpinDay.getTime() === today.getTime()) {
      //     const tomorrow = new Date(today);
      //     tomorrow.setDate(tomorrow.getDate() + 1);
      //     
      //     return res.status(429).json({ 
      //       error: "Daily spin limit reached. Come back tomorrow for your next spin!",
      //       code: "DAILY_LIMIT_REACHED",
      //       nextSpinTime: tomorrow.toISOString(),
      //       message: "You can spin again tomorrow!"
      //     });
      //   }
      // }

      const { mode = "saved" } = req.body;
      const accessToken = await spotifyAuth.getValidAccessToken(req.session.userId);

      let albums: any[] = [];

      // Different discovery modes
      switch (mode) {
        case "saved":
          // Use user's saved songs to find albums, not just saved albums
          let trackOffset = 0;
          const trackLimit = 50;
          const songAlbums = new Set();
          
          // Get saved tracks and extract their albums
          while (songAlbums.size < 200) {
            const savedTracks = await spotifyAuth.getUserSavedTracks(accessToken, trackLimit, trackOffset);
            if (savedTracks.length === 0) break;
            
            savedTracks.forEach((track: any) => {
              songAlbums.add(JSON.stringify(track.album)); // Use JSON to avoid duplicates
            });
            
            trackOffset += trackLimit;
            if (savedTracks.length < trackLimit) break;
          }
          
          // Convert back to album objects
          albums = Array.from(songAlbums).map((albumStr: any) => JSON.parse(albumStr));
          break;

        case "recommendations":
          try {
            // Get recommendations based on top artists and tracks
            const topArtists = await spotifyAuth.getUserTopArtists(accessToken, "medium_term", 10);
            const topTracks = await spotifyAuth.getUserTopTracks(accessToken, "medium_term", 10);
            
            if (topArtists.length === 0 && topTracks.length === 0) {
              // Fallback to recent tracks if no top data available
              const recentTracks = await spotifyAuth.getUserRecentlyPlayed(accessToken, 20);
              if (recentTracks.length > 0) {
                const recentArtistIds = Array.from(new Set(recentTracks.map((item: any) => item.track.artists[0].id)));
                for (const artistId of recentArtistIds.slice(0, 3)) {
                  const artistAlbums = await spotifyAuth.getArtistAlbums(accessToken, artistId, 5);
                  albums.push(...artistAlbums);
                }
              } else {
                // Final fallback to saved tracks
                const savedTracks = await spotifyAuth.getUserSavedTracks(accessToken, 50, 0);
                albums = savedTracks.map((track: any) => track.album);
              }
            } else {
              const seedArtists = topArtists.slice(0, Math.min(3, topArtists.length)).map((artist: any) => artist.id);
              const seedTracks = topTracks.slice(0, Math.min(2, topTracks.length)).map((track: any) => track.id);
              
              // Ensure we have at least one seed
              if (seedArtists.length === 0 && seedTracks.length === 0) {
                throw new Error("No seeds available");
              }
              
              const recommendations = await spotifyAuth.getRecommendations(accessToken, seedArtists, seedTracks, 50);
              albums = recommendations.map((track: any) => track.album).filter((album: any, index: number, self: any[]) => 
                self.findIndex(a => a.id === album.id) === index // Remove duplicates
              );
            }
          } catch (error) {
            console.log("Recommendations failed, using fallback:", error);
            // Fallback to top tracks' albums
            const topTracks = await spotifyAuth.getUserTopTracks(accessToken, "long_term", 50);
            if (topTracks.length > 0) {
              albums = topTracks.map((track: any) => track.album).filter((album: any, index: number, self: any[]) => 
                self.findIndex(a => a.id === album.id) === index
              );
            } else {
              // Final fallback to saved tracks
              const savedTracks = await spotifyAuth.getUserSavedTracks(accessToken, 50, 0);
              albums = savedTracks.map((track: any) => track.album).filter((album: any, index: number, self: any[]) => 
                self.findIndex(a => a.id === album.id) === index
              );
            }
          }
          break;

        case "discovery":
          try {
            // Get comprehensive list of artists user has ever listened to
            const listenedArtistIds = await spotifyAuth.getUserListenedArtistIds(accessToken);
            console.log(`Filtering out ${listenedArtistIds.length} artists user has already heard`);
            
            // Discover albums from similar artists, excluding ones user has heard before
            const userTopArtists = await spotifyAuth.getUserTopArtists(accessToken, "medium_term", 5);
            
            for (const artist of userTopArtists.slice(0, 3)) {
              try {
                const relatedArtists = await spotifyAuth.getRelatedArtists(accessToken, artist.id);
                
                // Filter out artists user has already listened to - this is the key improvement!
                const newArtists = relatedArtists.filter((relatedArtist: any) => 
                  !listenedArtistIds.includes(relatedArtist.id)
                );
                
                console.log(`Found ${newArtists.length} new artists similar to ${artist.name}`);
                
                for (const newArtist of newArtists.slice(0, 3)) {
                  try {
                    const artistAlbums = await spotifyAuth.getArtistAlbums(accessToken, newArtist.id, 5);
                    albums.push(...artistAlbums);
                  } catch (albumError) {
                    console.log(`Failed to get albums for new artist ${newArtist.id}:`, albumError);
                    // Continue with next artist
                  }
                }
              } catch (relatedError) {
                console.log(`Failed to get related artists for ${artist.id}:`, relatedError);
                // Continue with next artist
              }
            }
            
            // Remove duplicates
            albums = albums.filter((album: any, index: number, self: any[]) => 
              self.findIndex(a => a.id === album.id) === index
            );
            
            console.log(`New Artists discovery found ${albums.length} albums from unheard artists`);
            
            // If no albums found through discovery, fallback to recommendations but filter new artists
            if (albums.length === 0) {
              console.log("No new artists found, falling back to recommendations from new artists");
              const topArtists = await spotifyAuth.getUserTopArtists(accessToken, "medium_term", 3);
              const topTracks = await spotifyAuth.getUserTopTracks(accessToken, "medium_term", 2);
              
              const seedArtists = topArtists.slice(0, Math.min(3, topArtists.length)).map((artist: any) => artist.id);
              const seedTracks = topTracks.slice(0, Math.min(2, topTracks.length)).map((track: any) => track.id);
              
              if (seedArtists.length > 0 || seedTracks.length > 0) {
                const recommendations = await spotifyAuth.getRecommendations(accessToken, seedArtists, seedTracks, 50);
                albums = recommendations
                  .map((track: any) => track.album)
                  .filter((album: any) => !listenedArtistIds.includes(album.artists?.[0]?.id)) // Filter by artist, not album
                  .filter((album: any, index: number, self: any[]) => 
                    self.findIndex(a => a.id === album.id) === index
                  );
              }
            }
          } catch (error) {
            console.log("Discovery mode failed, using fallback that still prioritizes new artists:", error);
            
            try {
              // Get listened artists for filtering even in fallback
              const listenedArtistIds = await spotifyAuth.getUserListenedArtistIds(accessToken);
              
              // Try a broader search approach for new artists
              const searchTerms = ["indie", "alternative", "experimental", "emerging", "new", "fresh"];
              const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
              
              console.log(`New Artists fallback: searching for "${searchTerm}" and filtering known artists`);
              
              // Use existing search method to find albums from new artists
              const searchResults = await spotifyAuth.searchRandomPopularAlbums(accessToken, 30);
              albums = searchResults
                .filter((album: any) => !listenedArtistIds.includes(album.artists?.[0]?.id)) // Filter out known artists
                .filter((album: any, index: number, self: any[]) => 
                  self.findIndex(a => a.id === album.id) === index
                );
                
              console.log(`New Artists fallback found ${albums.length} albums from unheard artists`);
              
            } catch (fallbackError) {
              console.log("New Artists fallback also failed:", fallbackError);
              // As final resort, return empty array rather than user's own music
              albums = [];
            }
          }
          break;

        case "roulette":
          console.log("Russian Roulette mode: starting search");
          
          // Try multiple search attempts with different strategies
          for (let attempt = 0; attempt < 5 && albums.length < 10; attempt++) {
            try {
              const searchAlbums = await spotifyAuth.searchRandomPopularAlbums(accessToken, 15);
              albums.push(...searchAlbums);
              console.log(`Russian Roulette attempt ${attempt + 1}: found ${searchAlbums.length} albums`);
            } catch (searchError) {
              console.log(`Russian Roulette search attempt ${attempt + 1} failed:`, searchError);
            }
          }
          
          // Remove duplicates and apply minimal filtering
          if (albums.length > 0) {
            albums = albums
              .filter((album: any, index: number, self: any[]) => 
                self.findIndex(a => a.id === album.id) === index
              )
              .filter((album: any) => 
                album.total_tracks >= 1 && // Just needs to be an album
                album.images && album.images.length > 0 // Has cover art
              );
              
            console.log(`Russian Roulette SUCCESS: ${albums.length} unique albums found`);
          }
          
          // If search completely failed, use user's saved/top tracks as randomness
          if (albums.length === 0) {
            console.log("Russian Roulette: Search failed, using user's music for randomness");
            
            try {
              // Try to get saved tracks from a random offset for variety
              const randomOffset = Math.floor(Math.random() * 200);
              const savedTracks = await spotifyAuth.getUserSavedTracks(accessToken, 30, randomOffset);
              albums = savedTracks.map((track: any) => track.album).filter((album: any, index: number, self: any[]) => 
                self.findIndex(a => a.id === album.id) === index
              );
              console.log(`Russian Roulette fallback: Using ${albums.length} saved albums`);
            } catch (savedError) {
              console.log("Russian Roulette: Even saved tracks failed:", savedError);
              // Try top tracks as final fallback
              try {
                const topTracks = await spotifyAuth.getUserTopTracks(accessToken, "long_term", 25);
                albums = topTracks.map((track: any) => track.album).filter((album: any, index: number, self: any[]) => 
                  self.findIndex(a => a.id === album.id) === index
                );
                console.log(`Russian Roulette final fallback: Using ${albums.length} top albums`);
              } catch (topError) {
                console.log("Russian Roulette: All fallbacks failed:", topError);
              }
            }
          }
          break;

        default:
          return res.status(400).json({ error: "Invalid discovery mode" });
      }

      if (albums.length === 0) {
        return res.status(400).json({ 
          error: mode === "saved" ? "No saved albums found" : `No albums found for ${mode} mode. Try connecting with Spotify first or switch to saved albums mode.`
        });
      }

      // Filter out greatest hits and compilation albums
      const isGreatestHits = (album: any): boolean => {
        const albumName = album.name?.toLowerCase() || "";
        const albumType = album.album_type?.toLowerCase() || "";
        
        // Check album type first - compilation albums are typically greatest hits
        if (albumType === "compilation") {
          return true;
        }
        
        const greatestHitsPatterns = [
          "greatest hits",
          "best of",
          "the best of",
          "greatest",
          "hits",
          "collection",
          "anthology", 
          "essential",
          "essentials",
          "complete",
          "ultimate",
          "platinum",
          "gold",
          "definitive",
          "very best",
          "singles",
          "compilation",
          "retrospective",
          "selected",
          "classics",
          "favorites",
          "favourites"
        ];
        
        return greatestHitsPatterns.some(pattern => albumName.includes(pattern));
      };
      
      // Store original albums before filtering
      const originalAlbums = [...albums];
      const originalCount = albums.length;
      
      // Remove greatest hits albums
      albums = albums.filter(album => !isGreatestHits(album));
      
      if (albums.length < originalCount) {
        console.log(`Filtered out ${originalCount - albums.length} greatest hits albums`);
      }
      
      // If we filtered out too many albums and have very few left, allow some back
      if (albums.length < 3 && originalCount > 3) {
        console.log("Too few albums after filtering, keeping some greatest hits for variety");
        const greatestHitsAlbums = originalAlbums.filter(album => isGreatestHits(album));
        albums = albums.concat(greatestHitsAlbums.slice(0, Math.min(5, originalCount - albums.length)));
      }

      // Filter out singles and short EPs - ensure albums have at least 5 tracks for professional quality
      const beforeTrackFilter = albums.length;
      albums = albums.filter(album => album.total_tracks >= 5);
      
      if (albums.length < beforeTrackFilter) {
        console.log(`Filtered out ${beforeTrackFilter - albums.length} singles/short EPs (albums with < 5 tracks)`);
      }

      // Get recent spins to avoid duplicates (last 30 days)
      const recentSpins = await storage.getRecentSpinsByUser(req.session.userId, 30);
      const recentAlbumIds = new Set(recentSpins.map(spin => spin.albumId));

      // Filter out recently spun albums
      const availableAlbums = albums.filter(album => !recentAlbumIds.has(album.id));
      const selectedAlbums = availableAlbums.length > 0 ? availableAlbums : albums;

      // Pick random album
      const randomAlbum = selectedAlbums[Math.floor(Math.random() * selectedAlbums.length)];

      // Upsert album in database
      // Get preview URL by fetching album tracks
      let previewUrl = null;
      try {
        const tracksResponse = await spotifyAuth.getAlbumTracks(accessToken, randomAlbum.id);
        const trackWithPreview = tracksResponse.find((track: any) => track.preview_url);
        previewUrl = trackWithPreview?.preview_url || null;
      } catch (error) {
        console.log("Could not fetch preview for album:", randomAlbum.id);
      }

      const albumData = {
        id: randomAlbum.id,
        name: randomAlbum.name,
        artist: randomAlbum.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist",
        year: randomAlbum.release_date ? parseInt(randomAlbum.release_date.slice(0, 4)) : null,
        coverUrl: randomAlbum.images?.[0]?.url || null,
        previewUrl,
        genres: [], // Could be enhanced with genre data
      };

      await storage.upsertAlbum(albumData);

      // Create spin record
      const spin = await storage.createSpin({
        userId: req.session.userId,
        mode: mode,
        albumId: randomAlbum.id,
      });

      res.json({
        spinId: spin.id,
        album: {
          id: albumData.id,
          name: albumData.name,
          artist: albumData.artist,
          year: albumData.year,
          coverUrl: albumData.coverUrl,
          deepLink: `https://open.spotify.com/album/${albumData.id}`,
        },
        mode: mode,
      });
    } catch (error) {
      console.error("Spin error:", error);
      res.status(500).json({ error: "Failed to spin album" });
    }
  });

  app.get("/api/spins/:id", async (req, res) => {
    try {
      const spin = await storage.getSpin(req.params.id);
      if (!spin) {
        return res.status(404).json({ error: "Spin not found" });
      }

      res.json({
        id: spin.id,
        mode: spin.mode,
        startedAt: spin.startedAt,
        listenedAt: spin.listenedAt,
        album: {
          id: spin.album.id,
          name: spin.album.name,
          artist: spin.album.artist,
          year: spin.album.year,
          coverUrl: spin.album.coverUrl,
          deepLink: `https://open.spotify.com/album/${spin.album.id}`,
        },
      });
    } catch (error) {
      console.error("Get spin error:", error);
      res.status(500).json({ error: "Failed to get spin" });
    }
  });

  // Mark as listened and update streak
  app.post("/api/listened", async (req, res) => {
    try {
      const { spinId } = z.object({ spinId: z.string() }).parse(req.body);
      
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Update spin as listened
      await storage.updateSpin(spinId, { listenedAt: new Date() });

      // Update streak
      const today = new Date();
      const todayString = today.toISOString().slice(0, 10);
      
      let streak = await storage.getStreak(req.session.userId);
      
      if (!streak) {
        // Create new streak
        streak = await storage.upsertStreak({
          userId: req.session.userId,
          current: 1,
          longest: 1,
          lastSpinDate: today,
        });
      } else {
        const lastSpinDate = streak.lastSpinDate;
        let newCurrent = streak.current;
        
        if (lastSpinDate) {
          const lastSpinString = lastSpinDate.toISOString().slice(0, 10);
          const daysDiff = Math.floor((today.getTime() - lastSpinDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (lastSpinString === todayString) {
            // Already spun today, no change to streak
          } else if (daysDiff === 1) {
            // Consecutive day
            newCurrent += 1;
          } else {
            // Missed days, reset streak
            newCurrent = 1;
          }
        } else {
          newCurrent = 1;
        }
        
        const newLongest = Math.max(streak.longest, newCurrent);
        
        streak = await storage.upsertStreak({
          userId: req.session.userId,
          current: newCurrent,
          longest: newLongest,
          lastSpinDate: today,
        });
      }

      // 🎉 NEW: Check for trophies and update weekly stats
      const [newTrophies] = await Promise.all([
        trophyService.checkAndAwardTrophies(req.session.userId),
        weeklyStatsService.updateWeeklyStatsForSpin(req.session.userId, today),
      ]);

      res.json({
        ok: true,
        streak: {
          current: streak.current,
          longest: streak.longest,
        },
        newTrophies: newTrophies.length > 0 ? newTrophies : undefined,
      });
    } catch (error) {
      console.error("Listen error:", error);
      res.status(500).json({ error: "Failed to mark as listened" });
    }
  });

  // Share image generation
  app.post("/api/share", async (req, res) => {
    try {
      const { spinId } = z.object({ spinId: z.string() }).parse(req.body);
      
      const spin = await storage.getSpin(spinId);
      if (!spin) {
        return res.status(404).json({ error: "Spin not found" });
      }

      const imageBuffer = await generateShareImage({
        albumName: spin.album.name,
        artistName: spin.album.artist,
        coverUrl: spin.album.coverUrl || "",
      });

      res.setHeader("Content-Type", "image/svg+xml");
      res.send(imageBuffer);
    } catch (error) {
      console.error("Share error:", error);
      res.status(500).json({ error: "Failed to generate share image" });
    }
  });

  // Get user analytics
  app.get("/api/profile/analytics", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const analytics = await analyticsService.getUserAnalytics(req.session.userId);
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });

  // Get user's recent spins
  app.get("/api/profile/spins", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const spins = await storage.getSpinsByUser(req.session.userId, 10);
      
      res.json(spins.map(spin => ({
        id: spin.id,
        startedAt: spin.startedAt,
        listenedAt: spin.listenedAt,
        album: {
          id: spin.album.id,
          name: spin.album.name,
          artist: spin.album.artist,
          year: spin.album.year,
          coverUrl: spin.album.coverUrl,
          deepLink: `https://open.spotify.com/album/${spin.album.id}`,
        },
      })));
    } catch (error) {
      console.error("Profile spins error:", error);
      res.status(500).json({ error: "Failed to get profile spins" });
    }
  });

  // Trophy and Gamification Routes

  // Initialize trophies (run once)
  app.post("/api/admin/init-trophies", async (req, res) => {
    try {
      await trophyService.initializeTrophies();
      res.json({ message: "Trophies initialized successfully" });
    } catch (error) {
      console.error("Trophy initialization error:", error);
      res.status(500).json({ error: "Failed to initialize trophies" });
    }
  });

  // Clear and reinitialize trophies with new fun ones
  app.post("/api/admin/clear-and-init-trophies", async (req, res) => {
    try {
      // Clear existing trophies
      await db.delete(userTrophies);
      await db.delete(trophies);
      
      // Initialize new trophies
      await trophyService.initializeTrophies();
      res.json({ message: "Trophies cleared and reinitialized with new fun achievements!" });
    } catch (error) {
      console.error("Trophy reinitialization error:", error);
      res.status(500).json({ error: "Failed to reinitialize trophies" });
    }
  });

  // Get user's trophies
  app.get("/api/profile/trophies", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const trophies = await trophyService.getUserTrophies(req.session.userId);
      res.json(trophies);
    } catch (error) {
      console.error("Get trophies error:", error);
      res.status(500).json({ error: "Failed to get trophies" });
    }
  });

  // Get all trophies with user progress
  app.get("/api/trophies", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const trophies = await trophyService.getTrophiesWithProgress(req.session.userId);
      res.json(trophies);
    } catch (error) {
      console.error("Get all trophies error:", error);
      res.status(500).json({ error: "Failed to get trophies" });
    }
  });

  // Check and award new trophies for user
  app.post("/api/profile/check-trophies", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const newTrophies = await trophyService.checkAndAwardTrophies(req.session.userId);
      res.json({ newTrophies });
    } catch (error) {
      console.error("Check trophies error:", error);
      res.status(500).json({ error: "Failed to check trophies" });
    }
  });

  // Weekly Stats Routes

  // Get user's weekly recap
  app.get("/api/profile/weekly-recap", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const weekStartParam = req.query.weekStart as string;
      const weekStart = weekStartParam ? new Date(weekStartParam) : undefined;
      
      const recap = await weeklyStatsService.generateWeeklyRecap(req.session.userId, weekStart);
      res.json(recap);
    } catch (error) {
      console.error("Weekly recap error:", error);
      res.status(500).json({ error: "Failed to get weekly recap" });
    }
  });

  // Get user's recent weekly stats
  app.get("/api/profile/weekly-stats", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const stats = await weeklyStatsService.getUserRecentWeeklyStats(req.session.userId);
      res.json(stats);
    } catch (error) {
      console.error("Weekly stats error:", error);
      res.status(500).json({ error: "Failed to get weekly stats" });
    }
  });

  // Notification preferences routes
  app.get("/api/notifications/preferences", async (req, res) => {
    try {
      // Return default preferences for now
      res.json({
        dailyReminder: false,
        reminderTime: "18:00",
        weeklyRecap: true
      });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ error: "Failed to fetch notification preferences" });
    }
  });

  app.put("/api/notifications/preferences", async (req, res) => {
    try {
      const preferences = req.body;
      console.log("Notification preferences updated:", preferences);
      // For now just return success, in a real app this would save to database
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}