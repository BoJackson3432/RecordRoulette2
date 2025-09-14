import { Request, Response } from 'express';
import { db } from '../db';
import { users, spins, albums, challenges, userChallengeProgress } from '@shared/schema';
import { eq, count, desc, and, inArray, sql, ne } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface FriendChallenge {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  participants: string[];
  targetCount: number;
  currentProgress: Record<string, number>;
  endDate: Date;
  status: 'active' | 'completed' | 'expired';
  rewards: {
    winner: string;
    participants: string;
  };
}

export interface AlbumRecommendation {
  id: string;
  albumId: string;
  albumName: string;
  artist: string;
  coverUrl: string | null;
  recommendedBy: string;
  recommenderName: string;
  reason: string;
  isPersonal: boolean;
  tags: string[];
}

export class CollaborativeService {
  // Find potential friends based on music taste similarity
  static async findPotentialFriends(userId: string, limit = 10): Promise<any[]> {
    try {
      // Get user's recent spins to understand their music taste
      const userSpins = await db
        .select({
          albumId: spins.albumId,
          artist: albums.artist,
          genres: albums.genres
        })
        .from(spins)
        .innerJoin(albums, eq(spins.albumId, albums.id))
        .where(eq(spins.userId, userId))
        .limit(50);

      if (userSpins.length === 0) {
        return [];
      }

      // Extract genres and artists user listens to
      const userGenres = new Set<string>();
      const userArtists = new Set<string>();
      
      userSpins.forEach(spin => {
        if (spin.genres && Array.isArray(spin.genres)) {
          spin.genres.forEach((genre: string) => userGenres.add(genre));
        }
        if (spin.artist) {
          userArtists.add(spin.artist);
        }
      });

      // Find users with similar taste (simplified approach)
      const potentialFriends = await db
        .select({
          id: users.id,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          spinCount: count(spins.id)
        })
        .from(users)
        .leftJoin(spins, eq(users.id, spins.userId))
        .where(
          and(
            ne(users.id, userId),
            sql`${users.lastActiveAt} >= NOW() - INTERVAL '30 days'` // Active in last 30 days
          )
        )
        .groupBy(users.id, users.displayName, users.avatarUrl)
        .having(sql`COUNT(${spins.id}) > 5`) // At least 5 spins
        .orderBy(desc(count(spins.id)))
        .limit(limit * 3); // Get more to filter

      // Calculate similarity scores (simplified)
      const friendsWithScores = await Promise.all(
        potentialFriends.map(async (friend) => {
          const friendSpins = await db
            .select({
              artist: albums.artist,
              genres: albums.genres
            })
            .from(spins)
            .innerJoin(albums, eq(spins.albumId, albums.id))
            .where(eq(spins.userId, friend.id))
            .limit(50);

          const friendGenres = new Set<string>();
          const friendArtists = new Set<string>();
          
          friendSpins.forEach(spin => {
            if (spin.genres && Array.isArray(spin.genres)) {
              spin.genres.forEach((genre: string) => friendGenres.add(genre));
            }
            if (spin.artist) {
              friendArtists.add(spin.artist);
            }
          });

          // Calculate similarity
          const genreOverlap = Array.from(userGenres).filter(g => friendGenres.has(g)).length;
          const artistOverlap = Array.from(userArtists).filter(a => friendArtists.has(a)).length;
          
          const similarity = (genreOverlap * 2 + artistOverlap) / (userGenres.size + userArtists.size);

          return {
            ...friend,
            similarity,
            commonGenres: Array.from(userGenres).filter(g => friendGenres.has(g)).slice(0, 3),
            commonArtists: Array.from(userArtists).filter(a => friendArtists.has(a)).slice(0, 3)
          };
        })
      );

      // Sort by similarity and return top results
      return friendsWithScores
        .filter(f => f.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(friend => ({
          id: friend.id,
          displayName: friend.displayName || 'Music Lover',
          avatarUrl: friend.avatarUrl,
          spinCount: friend.spinCount,
          similarity: Math.round(friend.similarity * 100) / 100,
          commonGenres: friend.commonGenres,
          commonArtists: friend.commonArtists,
          matchReason: this.generateMatchReason(friend.commonGenres, friend.commonArtists)
        }));
    } catch (error) {
      console.error('Error finding potential friends:', error);
      return [];
    }
  }

  static generateMatchReason(genres: string[], artists: string[]): string {
    if (artists.length > 0 && genres.length > 0) {
      return `Both love ${artists[0]} and ${genres[0]} music`;
    } else if (artists.length > 0) {
      return `Fellow ${artists[0]} fan`;
    } else if (genres.length > 0) {
      return `Shares your taste for ${genres[0]}`;
    }
    return 'Similar music taste';
  }

  // Create friend challenge
  static async createFriendChallenge(
    creatorId: string, 
    name: string, 
    description: string,
    targetCount: number,
    durationDays: number = 7
  ): Promise<string> {
    const challengeId = uuidv4();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    await db.insert(challenges).values({
      id: challengeId,
      name,
      description,
      type: 'friend_challenge',
      category: 'social',
      requirement: {
        type: 'album_discovery',
        target: targetCount,
        metadata: { 
          creatorId,
          durationDays,
          challengeType: 'friend'
        }
      },
      reward: {
        type: 'social_recognition',
        value: 10,
        metadata: {
          winner_badge: 'Challenge Champion',
          participation_badge: 'Team Player'
        }
      },
      startDate: new Date(),
      endDate,
      isActive: true
    });

    // Add creator as participant
    await db.insert(userChallengeProgress).values({
      userId: creatorId,
      challengeId,
      progress: 0,
      completed: false
    });

    return challengeId;
  }

  // Get active friend challenges
  static async getActiveChallenges(userId: string): Promise<FriendChallenge[]> {
    const activeChallenges = await db
      .select({
        id: challenges.id,
        name: challenges.name,
        description: challenges.description,
        requirement: challenges.requirement,
        reward: challenges.reward,
        startDate: challenges.startDate,
        endDate: challenges.endDate,
        status: challenges.isActive
      })
      .from(challenges)
      .where(
        and(
          eq(challenges.type, 'friend_challenge'),
          eq(challenges.isActive, true),
          sql`${challenges.endDate} > NOW()`
        )
      )
      .orderBy(desc(challenges.startDate));

    // Get challenge progress for each challenge
    const challengeDetails = await Promise.all(
      activeChallenges.map(async (challenge: any) => {
        const participants = await db
          .select({
            userId: userChallengeProgress.userId,
            progress: userChallengeProgress.progress,
            completed: userChallengeProgress.completed,
            displayName: users.displayName
          })
          .from(userChallengeProgress)
          .innerJoin(users, eq(userChallengeProgress.userId, users.id))
          .where(eq(userChallengeProgress.challengeId, challenge.id));

        const requirement = challenge.requirement as any;
        const creatorId = requirement.metadata?.creatorId;
        const creator = participants.find(p => p.userId === creatorId);

        const currentProgress: Record<string, number> = {};
        participants.forEach(p => {
          currentProgress[p.userId] = p.progress;
        });

        return {
          id: challenge.id,
          name: challenge.name,
          description: challenge.description,
          creatorId: creatorId || 'unknown',
          creatorName: creator?.displayName || 'Unknown',
          participants: participants.map(p => p.userId),
          targetCount: requirement.target,
          currentProgress,
          endDate: challenge.endDate,
          status: challenge.endDate < new Date() ? 'expired' : 'active',
          rewards: {
            winner: 'Challenge Champion Badge',
            participants: 'Team Player Badge'
          }
        } as FriendChallenge;
      })
    );

    return challengeDetails;
  }

  // Join friend challenge
  static async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      // Check if user already joined
      const existing = await db
        .select()
        .from(userChallengeProgress)
        .where(
          and(
            eq(userChallengeProgress.userId, userId),
            eq(userChallengeProgress.challengeId, challengeId)
          )
        );

      if (existing.length > 0) {
        return false; // Already joined
      }

      // Check if challenge is still active
      const [challenge] = await db
        .select()
        .from(challenges)
        .where(
          and(
            eq(challenges.id, challengeId),
            eq(challenges.isActive, true),
            sql`${challenges.endDate} > NOW()`
          )
        );

      if (!challenge) {
        return false; // Challenge not found or expired
      }

      // Add user to challenge
      await db.insert(userChallengeProgress).values({
        userId,
        challengeId,
        progress: 0,
        completed: false
      });

      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  }

  // Update challenge progress when user spins
  static async updateChallengeProgress(userId: string, albumId: string) {
    try {
      // Get user's active challenges
      const activeUserChallenges = await db
        .select({
          challengeId: userChallengeProgress.challengeId,
          currentProgress: userChallengeProgress.progress,
          requirement: challenges.requirement
        })
        .from(userChallengeProgress)
        .innerJoin(challenges, eq(userChallengeProgress.challengeId, challenges.id))
        .where(
          and(
            eq(userChallengeProgress.userId, userId),
            eq(userChallengeProgress.completed, false),
            eq(challenges.isActive, true),
            sql`${challenges.endDate} > NOW()`
          )
        );

      // Update progress for each active challenge
      for (const challenge of activeUserChallenges) {
        const requirement = challenge.requirement as any;
        if (requirement.type === 'album_discovery') {
          const newProgress = challenge.currentProgress + 1;
          const isCompleted = newProgress >= requirement.target;

          await db
            .update(userChallengeProgress)
            .set({
              progress: newProgress,
              completed: isCompleted,
              completedAt: isCompleted ? new Date() : undefined
            })
            .where(
              and(
                eq(userChallengeProgress.userId, userId),
                eq(userChallengeProgress.challengeId, challenge.challengeId)
              )
            );
        }
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }

  // Get personalized album recommendations from similar users
  static async getPersonalizedRecommendations(userId: string, limit = 8): Promise<AlbumRecommendation[]> {
    try {
      // Get similar users
      const similarUsers = await this.findPotentialFriends(userId, 5);
      
      if (similarUsers.length === 0) {
        return [];
      }

      const similarUserIds = similarUsers.map(u => u.id);
      
      // Get albums they've listened to that current user hasn't
      const userAlbums = await db
        .select({ albumId: spins.albumId })
        .from(spins)
        .where(eq(spins.userId, userId));
      
      const userAlbumIds = new Set(userAlbums.map(s => s.albumId));

      const recommendations = await db
        .select({
          albumId: spins.albumId,
          albumName: albums.name,
          artist: albums.artist,
          coverUrl: albums.coverUrl,
          genres: albums.genres,
          recommendedBy: spins.userId,
          recommenderName: users.displayName,
          spinCount: count(spins.id)
        })
        .from(spins)
        .innerJoin(albums, eq(spins.albumId, albums.id))
        .innerJoin(users, eq(spins.userId, users.id))
        .where(
          and(
            inArray(spins.userId, similarUserIds),
            sql`${spins.albumId} NOT IN (${sql.join(Array.from(userAlbumIds).map(id => sql`${id}`), sql`, `)})`
          )
        )
        .groupBy(
          spins.albumId,
          albums.name,
          albums.artist,
          albums.coverUrl,
          albums.genres,
          spins.userId,
          users.displayName
        )
        .having(sql`COUNT(${spins.id}) >= 2`) // At least 2 spins
        .orderBy(desc(count(spins.id)))
        .limit(limit);

      return recommendations.map(rec => ({
        id: `${rec.albumId}-${rec.recommendedBy}`,
        albumId: rec.albumId,
        albumName: rec.albumName,
        artist: rec.artist,
        coverUrl: rec.coverUrl,
        recommendedBy: rec.recommendedBy,
        recommenderName: rec.recommenderName || 'Music Lover',
        reason: `${rec.recommenderName} listened to this ${rec.spinCount} times`,
        isPersonal: true,
        tags: Array.isArray(rec.genres) ? rec.genres.slice(0, 3) : []
      }));
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }
}

// API Routes
export async function findFriends(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit = 10 } = req.query;
    const potentialFriends = await CollaborativeService.findPotentialFriends(userId, Number(limit));

    res.json({
      recommendations: potentialFriends,
      count: potentialFriends.length
    });
  } catch (error) {
    console.error('Error finding friends:', error);
    res.status(500).json({ error: 'Failed to find friends' });
  }
}

export async function createChallenge(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, targetCount, durationDays } = req.body;

    if (!name || !description || !targetCount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const challengeId = await CollaborativeService.createFriendChallenge(
      userId,
      name,
      description,
      targetCount,
      durationDays || 7
    );

    res.json({
      success: true,
      challengeId,
      message: 'Challenge created successfully!'
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
}

export async function getChallenges(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const challenges = await CollaborativeService.getActiveChallenges(userId);

    res.json({
      challenges,
      count: challenges.length
    });
  } catch (error) {
    console.error('Error getting challenges:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
}

export async function joinChallenge(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { challengeId } = req.params;
    const success = await CollaborativeService.joinChallenge(userId, challengeId);

    if (success) {
      res.json({ success: true, message: 'Successfully joined challenge!' });
    } else {
      res.status(400).json({ error: 'Unable to join challenge' });
    }
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
}

export async function getPersonalizedRecommendations(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit = 8 } = req.query;
    const recommendations = await CollaborativeService.getPersonalizedRecommendations(userId, Number(limit));

    res.json({
      recommendations,
      count: recommendations.length,
      type: 'personalized'
    });
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
}