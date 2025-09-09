import { Request, Response } from 'express';
import { db } from '../db';
import { users, spins, streaks } from '@shared/schema';
import { eq, desc, count, sql, and, gte, lte } from 'drizzle-orm';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  rank: number;
  isCurrentUser?: boolean;
  change?: number; // Position change from last period
}

export interface CompetitionPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export class LeaderboardService {
  // Global leaderboards
  static async getGlobalStreakLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const results = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        longest: streaks.longest,
        current: streaks.current
      })
      .from(users)
      .innerJoin(streaks, eq(users.id, streaks.userId))
      .orderBy(desc(streaks.longest), desc(streaks.current))
      .limit(limit);

    return results.map((entry, index) => ({
      id: entry.id,
      displayName: entry.displayName || 'Anonymous Music Lover',
      avatarUrl: entry.avatarUrl,
      score: entry.longest,
      rank: index + 1
    }));
  }

  static async getGlobalDiscoveryLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const results = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        spinCount: count(spins.id)
      })
      .from(users)
      .leftJoin(spins, eq(users.id, spins.userId))
      .groupBy(users.id, users.displayName, users.avatarUrl)
      .orderBy(desc(count(spins.id)))
      .limit(limit);

    return results.map((entry, index) => ({
      id: entry.id,
      displayName: entry.displayName || 'Anonymous Music Lover',
      avatarUrl: entry.avatarUrl,
      score: entry.spinCount,
      rank: index + 1
    }));
  }

  static async getGlobalReferralLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const results = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        totalReferrals: users.totalReferrals
      })
      .from(users)
      .where(gte(users.totalReferrals, 1))
      .orderBy(desc(users.totalReferrals))
      .limit(limit);

    return results.map((entry, index) => ({
      id: entry.id,
      displayName: entry.displayName || 'Music Ambassador',
      avatarUrl: entry.avatarUrl,
      score: entry.totalReferrals,
      rank: index + 1
    }));
  }

  // Weekly leaderboards for competitions
  static async getWeeklyStreakLeaderboard(weekStart: Date, limit = 50): Promise<LeaderboardEntry[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // For now, use current streaks as weekly metric (could be enhanced with weekly tracking)
    const results = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        current: streaks.current,
        longest: streaks.longest
      })
      .from(users)
      .innerJoin(streaks, eq(users.id, streaks.userId))
      .where(and(
        gte(streaks.lastSpinDate!, weekStart),
        lte(streaks.lastSpinDate!, weekEnd)
      ))
      .orderBy(desc(streaks.current), desc(streaks.longest))
      .limit(limit);

    return results.map((entry, index) => ({
      id: entry.id,
      displayName: entry.displayName || 'Weekly Warrior',
      avatarUrl: entry.avatarUrl,
      score: entry.current,
      rank: index + 1
    }));
  }

  static async getWeeklyDiscoveryLeaderboard(weekStart: Date, limit = 50): Promise<LeaderboardEntry[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const results = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        weeklySpins: count(spins.id)
      })
      .from(users)
      .leftJoin(spins, eq(users.id, spins.userId))
      .where(and(
        gte(spins.startedAt, weekStart),
        lte(spins.startedAt, weekEnd)
      ))
      .groupBy(users.id, users.displayName, users.avatarUrl)
      .orderBy(desc(count(spins.id)))
      .limit(limit);

    return results.map((entry, index) => ({
      id: entry.id,
      displayName: entry.displayName || 'Discovery Champion',
      avatarUrl: entry.avatarUrl,
      score: entry.weeklySpins,
      rank: index + 1
    }));
  }

  // Friends leaderboard (placeholder - friends system not implemented yet)
  static async getFriendsLeaderboard(userId: string, category: 'streaks' | 'discoveries' = 'streaks'): Promise<LeaderboardEntry[]> {
    // Return empty for now - friends system not implemented
    return [];
  }

  // Get user's position in global leaderboards
  static async getUserRanking(userId: string): Promise<{
    streakRank: number;
    discoveryRank: number;
    referralRank: number;
  }> {
    // Get streak ranking
    const streakResult = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM users u
      INNER JOIN streaks s ON u.id = s.user_id
      WHERE s.longest > (
        SELECT s2.longest 
        FROM streaks s2 
        WHERE s2.user_id = ${userId}
      )
    `);

    // Get discovery ranking
    const discoveryResult = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT u.id, COUNT(sp.id) as spin_count
        FROM users u
        LEFT JOIN spins sp ON u.id = sp.user_id
        GROUP BY u.id
        HAVING spin_count > (
          SELECT COUNT(sp2.id)
          FROM spins sp2
          WHERE sp2.user_id = ${userId}
        )
      ) ranked
    `);

    // Get referral ranking
    const referralResult = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM users u
      WHERE u.total_referrals > (
        SELECT u2.total_referrals 
        FROM users u2 
        WHERE u2.id = ${userId}
      )
    `);

    return {
      streakRank: Number((streakResult.rows[0] as any)?.rank) || 999999,
      discoveryRank: Number((discoveryResult.rows[0] as any)?.rank) || 999999,
      referralRank: Number((referralResult.rows[0] as any)?.rank) || 999999
    };
  }

  // Competition periods management
  static getCurrentWeek(): CompetitionPeriod {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday start
    
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return {
      id: `week-${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`,
      name: 'Weekly Discovery Challenge',
      startDate: weekStart,
      endDate: weekEnd,
      isActive: true
    };
  }

  static getCurrentMonth(): CompetitionPeriod {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
      id: `month-${now.getFullYear()}-${now.getMonth() + 1}`,
      name: 'Monthly Music Marathon',
      startDate: monthStart,
      endDate: monthEnd,
      isActive: true
    };
  }

  // Viral sharing content generation
  static generateCompetitionShareContent(entry: LeaderboardEntry, competition: string, rank: number): {
    title: string;
    description: string;
    hashtags: string[];
    image?: string;
  } {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = rank <= 3 ? medals[rank - 1] : `#${rank}`;
    
    const shareTemplates = {
      weekly_streak: {
        title: `${medal} Weekly Streak Champion!`,
        description: `Just conquered this week's music discovery challenge with a ${entry.score}-day streak! 🎵 Who can beat that? Join me on RecordRoulette!`,
        hashtags: ['RecordRoulette', 'MusicChallenge', 'WeeklyWins', 'StreakLife']
      },
      weekly_discovery: {
        title: `${medal} Discovery Leader!`,
        description: `Discovered ${entry.score} amazing albums this week on RecordRoulette! 🎧 Music exploration level: EXPERT 🚀`,
        hashtags: ['RecordRoulette', 'MusicDiscovery', 'WeeklyChallenge', 'AlbumHunter']
      },
      global_streak: {
        title: `${medal} Global Streak Legend!`,
        description: `Ranked #${rank} globally with a ${entry.score}-day listening streak! 🌍 The music never stops on RecordRoulette 🎵`,
        hashtags: ['RecordRoulette', 'GlobalLeaderboard', 'StreakLegend', 'MusicAddict']
      },
      referral: {
        title: `${medal} Music Ambassador!`,
        description: `Brought ${entry.score} friends into the RecordRoulette community! 👥 Join the vinyl revolution 🎵`,
        hashtags: ['RecordRoulette', 'MusicCommunity', 'Ambassador', 'ShareTheMusic']
      }
    };

    return shareTemplates[competition as keyof typeof shareTemplates] || {
      title: `${medal} Leaderboard Champion!`,
      description: `Making moves on RecordRoulette! Join the music discovery revolution 🎵`,
      hashtags: ['RecordRoulette', 'MusicDiscovery', 'Champion']
    };
  }
}

// API Routes
export async function getLeaderboards(req: Request, res: Response) {
  try {
    const { type = 'global', category = 'streaks', period } = req.query;
    const userId = (req.session as any)?.userId;

    let leaderboard: LeaderboardEntry[] = [];
    let competition: CompetitionPeriod | null = null;

    if (type === 'global') {
      switch (category) {
        case 'streaks':
          leaderboard = await LeaderboardService.getGlobalStreakLeaderboard();
          break;
        case 'discoveries':
          leaderboard = await LeaderboardService.getGlobalDiscoveryLeaderboard();
          break;
        case 'referrals':
          leaderboard = await LeaderboardService.getGlobalReferralLeaderboard();
          break;
      }
    } else if (type === 'weekly') {
      competition = LeaderboardService.getCurrentWeek();
      switch (category) {
        case 'streaks':
          leaderboard = await LeaderboardService.getWeeklyStreakLeaderboard(competition.startDate);
          break;
        case 'discoveries':
          leaderboard = await LeaderboardService.getWeeklyDiscoveryLeaderboard(competition.startDate);
          break;
      }
    } else if (type === 'friends' && userId) {
      leaderboard = await LeaderboardService.getFriendsLeaderboard(userId, category as 'streaks' | 'discoveries');
    }

    // Mark current user
    if (userId) {
      leaderboard = leaderboard.map(entry => ({
        ...entry,
        isCurrentUser: entry.id === userId
      }));
    }

    res.json({
      leaderboard,
      competition,
      type,
      category,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting leaderboards:', error);
    res.status(500).json({ error: 'Failed to get leaderboards' });
  }
}

export async function getUserRanking(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ranking = await LeaderboardService.getUserRanking(userId);
    res.json(ranking);
  } catch (error) {
    console.error('Error getting user ranking:', error);
    res.status(500).json({ error: 'Failed to get user ranking' });
  }
}

export async function shareCompetitionResult(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { competition, rank, score, platform } = req.body;

    // Get user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const entry: LeaderboardEntry = {
      id: user.id,
      displayName: user.displayName || 'Music Lover',
      avatarUrl: user.avatarUrl,
      score,
      rank
    };

    const shareContent = LeaderboardService.generateCompetitionShareContent(entry, competition, rank);
    
    // Add RecordRoulette link
    const baseUrl = req.headers.origin || 'https://recordroulette.app';
    const shareUrl = `${baseUrl}?utm_source=${platform}&utm_medium=leaderboard&utm_campaign=competition`;

    res.json({
      ...shareContent,
      shareUrl,
      user: {
        displayName: entry.displayName,
        rank,
        score
      }
    });
  } catch (error) {
    console.error('Error creating competition share:', error);
    res.status(500).json({ error: 'Failed to create share content' });
  }
}