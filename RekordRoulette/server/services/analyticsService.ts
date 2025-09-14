import { db } from "../db";
import { spins, albums } from "@shared/schema";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";

export interface UserAnalytics {
  totalSpins: number;
  modePreferences: {
    mode: string;
    count: number;
    percentage: number;
  }[];
  favoriteMode: string | null;
  insights: string[];
  genreDistribution: {
    genre: string;
    count: number;
  }[];
  recentActivity: {
    last7Days: number;
    last30Days: number;
  };
  weeklyProgress: {
    currentWeekSpins: number;
    weekStartDate: string;
    daysCompleted: boolean[];
    motivationalMessage: string;
    progressPercentage: number;
  };
}

export class AnalyticsService {
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    // Get total spins for the user
    const totalSpins = await db
      .select({ count: count() })
      .from(spins)
      .where(eq(spins.userId, userId))
      .then(result => result[0]?.count || 0);

    // Get mode preferences
    const modeStats = await db
      .select({
        mode: spins.mode,
        count: count(),
      })
      .from(spins)
      .where(eq(spins.userId, userId))
      .groupBy(spins.mode)
      .orderBy(desc(count()));

    const modePreferences = modeStats.map(stat => ({
      mode: this.formatModeName(stat.mode),
      count: stat.count,
      percentage: Math.round((stat.count / Math.max(totalSpins, 1)) * 100)
    }));

    const favoriteMode = modePreferences[0]?.mode || null;

    // Get recent activity (last 7 and 30 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [recent7Days, recent30Days] = await Promise.all([
      db.select({ count: count() })
        .from(spins)
        .where(and(eq(spins.userId, userId), gte(spins.startedAt, sevenDaysAgo)))
        .then((result: any) => result[0]?.count || 0),
      
      db.select({ count: count() })
        .from(spins)
        .where(and(eq(spins.userId, userId), gte(spins.startedAt, thirtyDaysAgo)))
        .then((result: any) => result[0]?.count || 0)
    ]);

    // Get genre distribution from user's spins
    const genreData = await db
      .select({
        genres: albums.genres,
      })
      .from(spins)
      .innerJoin(albums, eq(spins.albumId, albums.id))
      .where(eq(spins.userId, userId));

    const genreCount: Record<string, number> = {};
    genreData.forEach(record => {
      if (Array.isArray(record.genres)) {
        record.genres.forEach(genre => {
          if (typeof genre === 'string') {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          }
        });
      }
    });

    const genreDistribution = Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get weekly progress
    const weeklyProgress = await this.getWeeklyProgress(userId);

    // Generate insights
    const insights = this.generateInsights({
      totalSpins,
      modePreferences,
      favoriteMode,
      genreDistribution,
      recentActivity: { last7Days: recent7Days, last30Days: recent30Days },
      weeklyProgress
    });

    return {
      totalSpins,
      modePreferences,
      favoriteMode,
      insights,
      genreDistribution,
      recentActivity: { last7Days: recent7Days, last30Days: recent30Days },
      weeklyProgress
    };
  }

  private async getWeeklyProgress(userId: string) {
    const now = new Date();
    // Start of current week (Monday)
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // Get spins for this week
    const weekSpins = await db
      .select({ startedAt: spins.startedAt })
      .from(spins)
      .where(and(eq(spins.userId, userId), gte(spins.startedAt, monday)))
      .orderBy(spins.startedAt);

    // Track which days have spins
    const daysCompleted = Array(7).fill(false);
    const spinDates = new Set();
    
    weekSpins.forEach(spin => {
      const spinDate = new Date(spin.startedAt);
      const dayIndex = spinDate.getDay();
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert Sunday=0 to Sunday=6
      daysCompleted[adjustedIndex] = true;
      spinDates.add(spinDate.toDateString());
    });

    const currentWeekSpins = spinDates.size;
    const progressPercentage = (currentWeekSpins / 7) * 100;

    // Generate motivational message
    let motivationalMessage = "";
    if (currentWeekSpins === 0) {
      motivationalMessage = "Start your week strong! Your first discovery awaits.";
    } else if (currentWeekSpins < 3) {
      motivationalMessage = `${currentWeekSpins}/7 days - You're building momentum!`;
    } else if (currentWeekSpins < 5) {
      motivationalMessage = `${currentWeekSpins}/7 days - Halfway there! Keep the streak alive.`;
    } else if (currentWeekSpins < 7) {
      motivationalMessage = `${currentWeekSpins}/7 days - So close to a perfect week!`;
    } else {
      motivationalMessage = "Perfect week! 🎉 You've discovered music every day!";
    }

    return {
      currentWeekSpins,
      weekStartDate: monday.toISOString(),
      daysCompleted,
      motivationalMessage,
      progressPercentage
    };
  }

  private formatModeName(mode: string): string {
    const modeMap: Record<string, string> = {
      'saved': 'Personal Albums',
      'recommendations': 'Recommendations', 
      'new-artists': 'New Artists',
      'similar': 'Similar Artists',
      'roulette': 'Russian Roulette'
    };
    return modeMap[mode] || mode;
  }

  private generateInsights(analytics: Partial<UserAnalytics> & { weeklyProgress?: any }): string[] {
    const insights: string[] = [];

    // Mode preference insights
    if (analytics.favoriteMode && analytics.modePreferences && analytics.modePreferences[0]) {
      const topMode = analytics.modePreferences[0];
      if (topMode.percentage > 50) {
        insights.push(`You're a ${topMode.mode} enthusiast! ${topMode.percentage}% of your spins use this mode.`);
      } else if (analytics.modePreferences.length > 1) {
        insights.push(`You love variety! Your top modes are ${analytics.modePreferences.slice(0, 2).map(m => m.mode).join(' and ')}.`);
      }
    }

    // Weekly progress insights
    if (analytics.weeklyProgress) {
      const { currentWeekSpins } = analytics.weeklyProgress;
      if (currentWeekSpins === 7) {
        insights.push("Perfect week! You've discovered music every day this week.");
      } else if (currentWeekSpins >= 5) {
        insights.push("You're on a roll! Great consistency this week.");
      } else if (currentWeekSpins >= 3) {
        insights.push("Building momentum! Keep your discovery streak going.");
      }
    }

    // Activity insights
    if (analytics.recentActivity) {
      if (analytics.recentActivity.last30Days >= 20) {
        insights.push("Music discovery master! You're incredibly consistent.");
      }
    }

    // Genre insights
    if (analytics.genreDistribution && analytics.genreDistribution.length > 0) {
      const topGenre = analytics.genreDistribution[0];
      if (topGenre.count >= 3) {
        insights.push(`You're exploring ${topGenre.genre} quite a bit! Consider branching out to new genres.`);
      }
    }

    // Total spins milestones
    if (analytics.totalSpins) {
      if (analytics.totalSpins >= 100) {
        insights.push("Century club member! You've discovered over 100 albums.");
      } else if (analytics.totalSpins >= 50) {
        insights.push("Halfway to 100! You're building an impressive discovery collection.");
      } else if (analytics.totalSpins >= 10) {
        insights.push("Double digits! You're getting into the discovery groove.");
      }
    }

    return insights.slice(0, 3); // Limit to 3 most relevant insights
  }
}

export const analyticsService = new AnalyticsService();