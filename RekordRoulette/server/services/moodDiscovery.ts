import { Request, Response } from 'express';
import { db } from '../db';
import { moods, userMoodPreferences, albums, spins } from '@shared/schema';
import { eq, and, inArray, sql, desc, asc } from 'drizzle-orm';
import axios from 'axios';

interface MoodDiscoveryRequest extends Request {
  session: {
    userId?: string;
    accessToken?: string;
  } & any;
}

// Mood-based discovery algorithms
export class MoodDiscoveryService {
  // Get all available moods
  static async getAllMoods() {
    return await db.select().from(moods).orderBy(moods.name);
  }

  // Get user's mood preferences
  static async getUserMoodPreferences(userId: string) {
    return await db
      .select({
        moodId: userMoodPreferences.moodId,
        name: moods.name,
        emoji: moods.emoji,
        description: moods.description,
        color: moods.color,
        preference: userMoodPreferences.preference
      })
      .from(userMoodPreferences)
      .innerJoin(moods, eq(userMoodPreferences.moodId, moods.id))
      .where(eq(userMoodPreferences.userId, userId))
      .orderBy(desc(userMoodPreferences.preference));
  }

  // Update user mood preferences based on their selections
  static async updateMoodPreference(userId: string, moodId: string) {
    // Check if preference exists
    const [existing] = await db
      .select()
      .from(userMoodPreferences)
      .where(
        and(
          eq(userMoodPreferences.userId, userId),
          eq(userMoodPreferences.moodId, moodId)
        )
      );

    if (existing) {
      // Increment preference
      await db
        .update(userMoodPreferences)
        .set({ 
          preference: existing.preference + 1
        })
        .where(
          and(
            eq(userMoodPreferences.userId, userId),
            eq(userMoodPreferences.moodId, moodId)
          )
        );
    } else {
      // Create new preference
      await db.insert(userMoodPreferences).values({
        userId,
        moodId,
        preference: 1
      });
    }
  }

  // Get mood-based album recommendations using Spotify's API
  static async getMoodBasedRecommendations(accessToken: string, moodName: string, userId: string): Promise<any[]> {
    try {
      // Simple mood-based recommendations using user's saved albums
      const response = await axios.get('https://api.spotify.com/v1/me/albums', {
        params: { limit: 50 },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const albums = response.data.items || [];
      
      // Filter and shuffle albums based on mood (simplified for now)
      const moodFilteredAlbums = albums
        .map((item: any) => ({
          id: item.album.id,
          name: item.album.name,
          artist: item.album.artists[0].name,
          year: item.album.release_date ? new Date(item.album.release_date).getFullYear() : null,
          coverUrl: item.album.images[0]?.url,
          genres: item.album.genres || [],
          moodMatch: moodName,
          reason: this.getMoodRecommendationReason(moodName, item.album)
        }))
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, 8);

      return moodFilteredAlbums;
    } catch (error) {
      console.error('Error getting mood-based recommendations:', error);
      return [];
    }
  }

  // Define audio feature targets for different moods
  static getMoodAudioFeatures(moodName: string) {
    const moodFeatures = {
      'Chill': {
        target_energy: 0.3,
        target_valence: 0.5,
        target_danceability: 0.4,
        target_tempo: 90,
        target_acousticness: 0.7
      },
      'Energetic': {
        target_energy: 0.8,
        target_valence: 0.8,
        target_danceability: 0.8,
        target_tempo: 130,
        target_acousticness: 0.2
      },
      'Sad': {
        target_energy: 0.2,
        target_valence: 0.2,
        target_danceability: 0.3,
        target_tempo: 70,
        target_acousticness: 0.6,
        target_instrumentalness: 0.3
      },
      'Happy': {
        target_energy: 0.7,
        target_valence: 0.9,
        target_danceability: 0.7,
        target_tempo: 120,
        target_acousticness: 0.3
      },
      'Focus': {
        target_energy: 0.5,
        target_valence: 0.5,
        target_danceability: 0.3,
        target_instrumentalness: 0.7,
        target_acousticness: 0.5
      },
      'Party': {
        target_energy: 0.9,
        target_valence: 0.8,
        target_danceability: 0.9,
        target_tempo: 125,
        target_acousticness: 0.1
      },
      'Nostalgic': {
        target_energy: 0.4,
        target_valence: 0.6,
        target_danceability: 0.5,
        target_popularity: 70 // Favor more well-known tracks
      },
      'Romantic': {
        target_energy: 0.4,
        target_valence: 0.7,
        target_danceability: 0.5,
        target_acousticness: 0.6,
        target_instrumentalness: 0.2
      }
    };

    return moodFeatures[moodName as keyof typeof moodFeatures] || moodFeatures['Happy'];
  }

  // Generate reason for mood recommendation
  static getMoodRecommendationReason(moodName: string, album: any): string {
    const reasons = {
      'Chill': `Perfect for relaxing with its mellow ${Math.round(track.energy * 100)}% energy level`,
      'Energetic': `High energy track (${Math.round(track.energy * 100)}%) to pump you up`,
      'Sad': `Emotionally resonant with ${Math.round(track.valence * 100)}% positivity`,
      'Happy': `Uplifting vibes with ${Math.round(track.valence * 100)}% positivity`,
      'Focus': `Great for concentration with minimal distractions`,
      'Party': `Dance-ready with ${Math.round(track.danceability * 100)}% danceability`,
      'Nostalgic': `Classic sound that brings back memories`,
      'Romantic': `Intimate and heartfelt for special moments`
    };

    return reasons[moodName as keyof typeof reasons] || `Matches your ${moodName.toLowerCase()} mood perfectly`;
  }

  // Time-based discovery recommendations
  static async getTimeBasedRecommendations(accessToken: string, timeContext: string, userId: string): Promise<any[]> {
    try {
      // Get user's recent tracks for time-based recommendations
      const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
        params: { limit: 50 },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const recentItems = response.data.items || [];
      
      // Group recent tracks by album and select unique albums
      const albumMap = new Map();
      
      for (const item of recentItems) {
        const album = item.track.album;
        if (!albumMap.has(album.id)) {
          albumMap.set(album.id, {
            id: album.id,
            name: album.name,
            artist: album.artists[0].name,
            year: album.release_date ? new Date(album.release_date).getFullYear() : null,
            coverUrl: album.images[0]?.url,
            timeContext,
            reason: this.getTimeRecommendationReason(timeContext, new Date().getHours())
          });
        }
      }
      
      const timeBasedAlbums = Array.from(albumMap.values())
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);

      return timeBasedAlbums;
    } catch (error) {
      console.error('Error getting time-based recommendations:', error);
      // Fallback to saved albums if recent tracks fails
      try {
        const response = await axios.get('https://api.spotify.com/v1/me/albums', {
          params: { limit: 20 },
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        return response.data.items?.map((item: any) => ({
          id: item.album.id,
          name: item.album.name,
          artist: item.album.artists[0].name,
          year: item.album.release_date ? new Date(item.album.release_date).getFullYear() : null,
          coverUrl: item.album.images[0]?.url,
          timeContext,
          reason: this.getTimeRecommendationReason(timeContext, new Date().getHours())
        })).slice(0, 8) || [];
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  // Time-based audio feature preferences
  static getTimeBasedFeatures(timeContext: string, currentHour: number) {
    const timeFeatures = {
      'morning': {
        target_energy: 0.6,
        target_valence: 0.7,
        target_danceability: 0.5,
        target_acousticness: 0.4
      },
      'afternoon': {
        target_energy: 0.7,
        target_valence: 0.6,
        target_danceability: 0.6,
        target_tempo: 115
      },
      'evening': {
        target_energy: 0.5,
        target_valence: 0.6,
        target_danceability: 0.5,
        target_acousticness: 0.5
      },
      'night': {
        target_energy: 0.3,
        target_valence: 0.4,
        target_danceability: 0.4,
        target_acousticness: 0.7
      },
      'workout': {
        target_energy: 0.9,
        target_danceability: 0.8,
        target_tempo: 130,
        target_valence: 0.7
      },
      'commute': {
        target_energy: 0.6,
        target_valence: 0.6,
        target_danceability: 0.5,
        target_popularity: 60
      }
    };

    // Auto-detect time context if not specified
    if (!timeContext) {
      if (currentHour >= 5 && currentHour < 12) timeContext = 'morning';
      else if (currentHour >= 12 && currentHour < 17) timeContext = 'afternoon';
      else if (currentHour >= 17 && currentHour < 22) timeContext = 'evening';
      else timeContext = 'night';
    }

    return timeFeatures[timeContext as keyof typeof timeFeatures] || timeFeatures['afternoon'];
  }

  // Generate reason for time-based recommendation
  static getTimeRecommendationReason(timeContext: string, currentHour: number): string {
    const reasons = {
      'morning': 'Perfect for starting your day with positive energy',
      'afternoon': 'Great for staying productive and focused',
      'evening': 'Ideal for winding down after a busy day', 
      'night': 'Calming sounds for late night listening',
      'workout': 'High energy beats to fuel your exercise',
      'commute': 'Engaging music for your journey'
    };

    return reasons[timeContext as keyof typeof reasons] || `Tailored for ${timeContext} listening`;
  }
}

// API Routes for mood discovery
export async function getMoods(req: Request, res: Response) {
  try {
    const moods = await MoodDiscoveryService.getAllMoods();
    res.json(moods);
  } catch (error) {
    console.error('Error getting moods:', error);
    res.status(500).json({ error: 'Failed to get moods' });
  }
}

export async function getUserMoodPreferences(req: MoodDiscoveryRequest, res: Response) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const preferences = await MoodDiscoveryService.getUserMoodPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error getting user mood preferences:', error);
    res.status(500).json({ error: 'Failed to get mood preferences' });
  }
}

export async function discoverByMood(req: MoodDiscoveryRequest, res: Response) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { moodId } = req.params;
    const accessToken = req.session.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: 'Spotify access token required' });
    }

    // Get mood details
    const [mood] = await db.select().from(moods).where(eq(moods.id, moodId));
    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }

    // Update user's mood preference
    await MoodDiscoveryService.updateMoodPreference(userId, moodId);

    // Get mood-based recommendations
    const recommendations = await MoodDiscoveryService.getMoodBasedRecommendations(
      accessToken,
      mood.name,
      userId
    );

    res.json({
      mood,
      recommendations,
      discoveryType: 'mood'
    });
  } catch (error) {
    console.error('Error getting mood-based discovery:', error);
    res.status(500).json({ error: 'Failed to get mood-based recommendations' });
  }
}

export async function discoverByTime(req: MoodDiscoveryRequest, res: Response) {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { timeContext } = req.params;
    const accessToken = req.session.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: 'Spotify access token required' });
    }

    // Get time-based recommendations
    const recommendations = await MoodDiscoveryService.getTimeBasedRecommendations(
      accessToken,
      timeContext,
      userId
    );

    res.json({
      timeContext,
      recommendations,
      discoveryType: 'time'
    });
  } catch (error) {
    console.error('Error getting time-based discovery:', error);
    res.status(500).json({ error: 'Failed to get time-based recommendations' });
  }
}