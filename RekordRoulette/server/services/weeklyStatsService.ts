import { db } from "../db";
import { 
  weeklyStats, 
  spins, 
  albums, 
  users,
  type WeeklyStats, 
  type InsertWeeklyStats 
} from "@shared/schema";
import { eq, and, gte, lt, sql, desc } from "drizzle-orm";
import { startOfWeek, endOfWeek, format } from "date-fns";

export class WeeklyStatsService {
  // Generate weekly stats for a user
  async generateWeeklyStats(userId: string, weekStart?: Date): Promise<WeeklyStats> {
    const week = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(week, { weekStartsOn: 1 });

    // Check if stats already exist for this week
    const [existingStats] = await db
      .select()
      .from(weeklyStats)
      .where(and(
        eq(weeklyStats.userId, userId),
        eq(weeklyStats.weekStart, week)
      ));

    if (existingStats) {
      return existingStats;
    }

    // Get user's spins for this week
    const weekSpins = await db
      .select({
        spin: spins,
        album: albums,
      })
      .from(spins)
      .innerJoin(albums, eq(spins.albumId, albums.id))
      .where(and(
        eq(spins.userId, userId),
        gte(spins.startedAt, week),
        lt(spins.startedAt, weekEnd)
      ))
      .orderBy(desc(spins.startedAt));

    // Calculate statistics
    const totalSpins = weekSpins.length;
    const listenedSpins = weekSpins.filter(s => s.spin.listenedAt).length;
    
    // Unique artists and genres
    const uniqueArtists = new Set(weekSpins.map(s => s.album.artist)).size;
    const allGenres = weekSpins.flatMap(s => s.album.genres || []);
    const uniqueGenres = new Set(allGenres).size;

    // Discovery modes breakdown
    const discoveryModes: Record<string, number> = {};
    weekSpins.forEach(s => {
      discoveryModes[s.spin.mode] = (discoveryModes[s.spin.mode] || 0) + 1;
    });

    // Genre breakdown
    const genres: Record<string, number> = {};
    allGenres.forEach(genre => {
      genres[genre] = (genres[genre] || 0) + 1;
    });

    // Top albums (most popular this week by play count)
    const albumCounts: Record<string, { count: number; album: any }> = {};
    weekSpins.forEach(s => {
      if (!albumCounts[s.album.id]) {
        albumCounts[s.album.id] = { count: 0, album: s.album };
      }
      albumCounts[s.album.id].count++;
    });

    const topAlbums = Object.values(albumCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        id: item.album.id,
        name: item.album.name,
        artist: item.album.artist,
        coverUrl: item.album.coverUrl as string | undefined,
      })) as Array<{id: string; name: string; artist: string; coverUrl?: string}>;

    // Calculate streak days (days with at least one spin)
    const spinDays = new Set();
    weekSpins.forEach(s => {
      const day = format(s.spin.startedAt, 'yyyy-MM-dd');
      spinDays.add(day);
    });
    const streakDays = spinDays.size;

    const statsData: InsertWeeklyStats = {
      userId,
      weekStart: week,
      weekEnd,
      totalSpins,
      listenedSpins,
      uniqueArtists,
      uniqueGenres,
      discoveryModes,
      genres,
      topAlbums: topAlbums as Array<{id: string; name: string; artist: string; coverUrl?: string}>,
      streakDays,
    };

    // Insert the stats
    const [newStats] = await db
      .insert(weeklyStats)
      .values([statsData])
      .returning();

    return newStats;
  }

  // Get user's weekly stats for a specific week or current week
  async getUserWeeklyStats(userId: string, weekStart?: Date): Promise<WeeklyStats | null> {
    const week = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });

    const [stats] = await db
      .select()
      .from(weeklyStats)
      .where(and(
        eq(weeklyStats.userId, userId),
        eq(weeklyStats.weekStart, week)
      ));

    return stats || null;
  }

  // Get user's recent weekly stats (last 8 weeks)
  async getUserRecentWeeklyStats(userId: string): Promise<WeeklyStats[]> {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - (8 * 7));

    return await db
      .select()
      .from(weeklyStats)
      .where(and(
        eq(weeklyStats.userId, userId),
        gte(weeklyStats.weekStart, eightWeeksAgo)
      ))
      .orderBy(desc(weeklyStats.weekStart));
  }

  // Generate recap card data
  async generateWeeklyRecap(userId: string, weekStart?: Date) {
    const week = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
    let stats = await this.getUserWeeklyStats(userId, week);

    // Generate stats if they don't exist
    if (!stats) {
      stats = await this.generateWeeklyStats(userId, week);
    }

    // Get user info for personalization
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    // Calculate some insights
    const completionRate = stats.totalSpins > 0 ? 
      Math.round((stats.listenedSpins / stats.totalSpins) * 100) : 0;

    const topGenre = Object.entries(stats.genres as Record<string, number>)
      .sort(([,a], [,b]) => b - a)[0];

    const topMode = Object.entries(stats.discoveryModes as Record<string, number>)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      user: user?.displayName || 'Music Lover',
      weekStart: stats.weekStart,
      weekEnd: stats.weekEnd,
      stats: {
        totalSpins: stats.totalSpins,
        listenedSpins: stats.listenedSpins,
        uniqueArtists: stats.uniqueArtists,
        uniqueGenres: stats.uniqueGenres,
        streakDays: stats.streakDays,
        completionRate,
      },
      insights: {
        topGenre: topGenre ? { name: topGenre[0], count: topGenre[1] } : null,
        topMode: topMode ? { name: topMode[0], count: topMode[1] } : null,
        diversityScore: Math.min(stats.uniqueGenres * 10, 100), // Max 100
      },
      topAlbums: stats.topAlbums,
      achievements: [], // Will be populated by trophy service
    };
  }

  // Update weekly stats when user completes a spin
  async updateWeeklyStatsForSpin(userId: string, spinDate: Date) {
    const weekStart = startOfWeek(spinDate, { weekStartsOn: 1 });
    
    // Regenerate stats for this week
    await this.generateWeeklyStats(userId, weekStart);
  }
}

export const weeklyStatsService = new WeeklyStatsService();