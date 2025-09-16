import { Request, Response } from "express";
import axios from "axios";
import { storage } from "../storage";

const SPOTIFY_CONFIG = {
  AUTH_URL: "https://accounts.spotify.com/authorize",
  TOKEN_URL: "https://accounts.spotify.com/api/token",
  API_BASE: "https://api.spotify.com/v1",
  SCOPES: "user-read-email user-library-read user-read-recently-played user-top-read user-read-playback-state user-modify-playback-state streaming",
};

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

export class SpotifyAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID!;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    
    // Use provided redirect URI or dynamically determine based on environment
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 
                      `https://${process.env.REPLIT_DEV_DOMAIN || `rekord-roulette-${process.env.REPL_OWNER}.replit.app`}/auth/spotify/callback`;

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Missing Spotify OAuth configuration");
    }
    
    console.log("Spotify redirect URI:", this.redirectUri);
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      scope: SPOTIFY_CONFIG.SCOPES,
      redirect_uri: this.redirectUri,
      state,
    });

    return `${SPOTIFY_CONFIG.AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.redirectUri,
    });

    const response = await axios.post(SPOTIFY_CONFIG.TOKEN_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
      },
    });

    return response.data;
  }

  async refreshTokens(refreshToken: string): Promise<SpotifyTokens> {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const response = await axios.post(SPOTIFY_CONFIG.TOKEN_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
      },
    });

    return response.data;
  }

  async getSpotifyUser(accessToken: string): Promise<SpotifyUser> {
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getUserSavedAlbums(accessToken: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/me/albums`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit, offset },
    });
    return response.data.items.map((item: any) => item.album);
  }

  async getUserSavedTracks(accessToken: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/me/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit, offset },
    });
    return response.data.items.map((item: any) => item.track);
  }

  async getUserTopArtists(accessToken: string, timeRange: string = "medium_term", limit: number = 50): Promise<any[]> {
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/me/top/artists`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { time_range: timeRange, limit },
    });
    return response.data.items;
  }

  async getUserTopTracks(accessToken: string, timeRange: string = "medium_term", limit: number = 50): Promise<any[]> {
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/me/top/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { time_range: timeRange, limit },
    });
    return response.data.items;
  }

  async getUserRecentlyPlayed(accessToken: string, limit: number = 50): Promise<any[]> {
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/me/player/recently-played`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit },
    });
    return response.data.items;
  }

  async getArtistAlbums(accessToken: string, artistId: string, limit: number = 20): Promise<any[]> {
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/artists/${artistId}/albums`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { include_groups: "album,single", limit },
    });
    return response.data.items;
  }

  async getRecommendations(accessToken: string, seedArtists: string[], seedTracks: string[], limit: number = 20): Promise<any[]> {
    const params: any = { limit };
    if (seedArtists.length > 0) params.seed_artists = seedArtists.slice(0, 5).join(",");
    if (seedTracks.length > 0) params.seed_tracks = seedTracks.slice(0, 5).join(",");
    
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/recommendations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });
    return response.data.tracks;
  }

  async getRelatedArtists(accessToken: string, artistId: string): Promise<any[]> {
    const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/artists/${artistId}/related-artists`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data.artists;
  }

  async getUserSavedAlbumIds(accessToken: string, limit: number = 50): Promise<string[]> {
    try {
      const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/me/albums`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit },
      });
      return response.data.items.map((item: any) => item.album.id);
    } catch (error) {
      console.log("Failed to get saved albums:", error);
      return [];
    }
  }

  async getUserListenedArtistIds(accessToken: string): Promise<string[]> {
    try {
      const artistIds = new Set<string>();
      
      // Get top artists (multiple time ranges for comprehensive coverage)
      const timeRanges = ['short_term', 'medium_term', 'long_term'];
      for (const timeRange of timeRanges) {
        try {
          const topArtists = await this.getUserTopArtists(accessToken, timeRange, 50);
          topArtists.forEach((artist: any) => artistIds.add(artist.id));
        } catch (error) {
          console.log(`Failed to get ${timeRange} top artists:`, error);
        }
      }
      
      // Get recently played tracks and extract artist IDs
      try {
        const recentTracks = await this.getUserRecentlyPlayed(accessToken, 50);
        recentTracks.forEach((item: any) => {
          if (item.track?.artists) {
            item.track.artists.forEach((artist: any) => artistIds.add(artist.id));
          }
        });
      } catch (error) {
        console.log("Failed to get recent tracks:", error);
      }
      
      // Get saved tracks and extract artist IDs
      try {
        const savedTracks = await this.getUserSavedTracks(accessToken, 50, 0);
        savedTracks.forEach((track: any) => {
          if (track.artists) {
            track.artists.forEach((artist: any) => artistIds.add(artist.id));
          }
        });
      } catch (error) {
        console.log("Failed to get saved tracks:", error);
      }
      
      const result = Array.from(artistIds);
      console.log(`Found ${result.length} artists in user's listening history`);
      return result;
      
    } catch (error) {
      console.log("Failed to get user's listened artist IDs:", error);
      return [];
    }
  }

  async searchRandomPopularAlbums(accessToken: string, limit: number = 50): Promise<any[]> {
    // Use extremely simple and reliable search approaches
    const simpleSearches = [
      // Just use single common letters
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "v", "w", "y", "z",
      // Very common words
      "the", "love", "me", "you", "my", "we", "one", "all", "new", "best", "live", "blue", "red", "black", "white", "good", "bad"
    ];
    
    // Try multiple simple searches
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const searchTerm = simpleSearches[Math.floor(Math.random() * simpleSearches.length)];
        const randomOffset = Math.floor(Math.random() * 200); // Very small offset
        
        console.log(`Russian Roulette attempt ${attempt + 1}: searching for "${searchTerm}" offset ${randomOffset}`);
        
        const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/search`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            q: searchTerm,
            type: "album",
            limit: 15,
            offset: randomOffset
          },
        });
        
        if (response.data.albums && response.data.albums.items) {
          const albums = response.data.albums.items.filter((album: any) => 
            album.popularity > 10 && // Very low threshold
            album.total_tracks >= 2 && // Allow shorter albums
            album.artists?.[0]?.name && // Has artist
            album.images && album.images.length > 0 // Has cover
          );
          
          if (albums.length > 0) {
            console.log(`Russian Roulette SUCCESS: Found ${albums.length} albums with "${searchTerm}"`);
            return albums;
          }
        }
        
      } catch (error: any) {
        console.log(`Russian Roulette attempt ${attempt + 1} failed:`, error.response?.status || error.message);
        continue;
      }
    }
    
    console.log("Russian Roulette: All simple searches failed, trying fallback");
    
    // Ultimate fallback - search for nothing (gets popular albums)
    try {
      const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/search`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          q: "*", // Wildcard search
          type: "album",
          limit: 20,
          offset: Math.floor(Math.random() * 100)
        },
      });
      
      if (response.data.albums && response.data.albums.items) {
        console.log("Russian Roulette: Wildcard search succeeded");
        return response.data.albums.items;
      }
    } catch (error) {
      console.log("Russian Roulette: Even wildcard search failed:", error);
    }
    
    return [];
  }

  async startAlbumPlayback(accessToken: string, albumId: string): Promise<void> {
    try {
      // First, disable shuffle to ensure album plays in order
      await axios.put(`${SPOTIFY_CONFIG.API_BASE}/me/player/shuffle`, null, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { state: false },
      });

      // Start playing the album from the first track
      await axios.put(`${SPOTIFY_CONFIG.API_BASE}/me/player/play`, {
        context_uri: `spotify:album:${albumId}`,
        offset: { position: 0 }, // Start from first track
      }, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });
    } catch (error: any) {
      // If no active device, throw specific error
      if (error.response?.status === 404) {
        throw new Error("No active Spotify device found. Please open Spotify on a device first.");
      }
      // If premium required
      if (error.response?.status === 403) {
        throw new Error("Spotify Premium is required for playback control.");
      }
      throw new Error(`Failed to start playback: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    // Check if token is still valid (with 5-minute buffer)
    if (user.tokenExpires && user.tokenExpires.getTime() > Date.now() + 5 * 60 * 1000) {
      return user.accessToken!;
    }

    // Refresh token
    if (!user.refreshToken) throw new Error("No refresh token available");

    const tokens = await this.refreshTokens(user.refreshToken);
    
    await storage.updateUser(userId, {
      accessToken: tokens.access_token,
      tokenExpires: new Date(Date.now() + (tokens.expires_in - 60) * 1000),
      ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
    });

    return tokens.access_token;
  }

  async getAlbumTracks(accessToken: string, albumId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/albums/${albumId}/tracks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          limit: 10 // Get first 10 tracks to find one with preview
        }
      });
      return response.data.items || [];
    } catch (error: any) {
      console.error("Error fetching album tracks:", error.response?.data || error.message);
      return [];
    }
  }
}

export const spotifyAuth = new SpotifyAuth();

// Express route handlers
export const handleSpotifyLogin = (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  req.session.oauthState = state;
  
  const authUrl = spotifyAuth.getAuthUrl(state);
  res.redirect(authUrl);
};

export const handleSpotifyCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    
    if (!code || !state || state !== req.session.oauthState) {
      return res.status(400).json({ error: "Invalid state or missing code" });
    }

    const tokens = await spotifyAuth.exchangeCodeForTokens(code);
    const spotifyUser = await spotifyAuth.getSpotifyUser(tokens.access_token);

    let user = await storage.getUserByProviderId(spotifyUser.id);
    
    if (user) {
      // Update existing user
      user = await storage.updateUser(user.id, {
        displayName: spotifyUser.display_name,
        email: spotifyUser.email,
        avatarUrl: spotifyUser.images?.[0]?.url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpires: new Date(Date.now() + (tokens.expires_in - 60) * 1000),
      });
    } else {
      // Create new user
      user = await storage.createUser({
        provider: "spotify",
        providerId: spotifyUser.id,
        displayName: spotifyUser.display_name,
        email: spotifyUser.email,
        avatarUrl: spotifyUser.images?.[0]?.url,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpires: new Date(Date.now() + (tokens.expires_in - 60) * 1000),
      });
    }

    req.session.userId = user.id;
    res.redirect("/");
  } catch (error) {
    console.error("Spotify callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
