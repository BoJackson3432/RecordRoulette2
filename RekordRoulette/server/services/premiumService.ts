import { Request, Response } from 'express';
import { db } from '../db';
import { users, spins, albums, streaks } from '@shared/schema';
import { eq, count, desc, gte, lte, and, sql } from 'drizzle-orm';

export const PREMIUM_TIERS = {
  free: {
    name: 'Free',
    dailySpinLimit: 5,
    features: ['Basic Discovery', 'Weekly Stats', 'Social Sharing'],
    price: 0
  },
  premium: {
    name: 'Premium',
    dailySpinLimit: -1, // Unlimited
    features: [
      'Unlimited Spins', 
      'Advanced Analytics', 
      'Mood Discovery', 
      'Custom Themes',
      'Priority Support',
      'Export Data'
    ],
    price: 9.99
  },
  pro: {
    name: 'Pro',
    dailySpinLimit: -1, // Unlimited
    features: [
      'Everything in Premium',
      'Advanced AI Recommendations',
      'Custom Discovery Modes',
      'Playlist Integration',
      'Early Access Features',
      'Personal Music Concierge'
    ],
    price: 19.99
  }
} as const;

export class PremiumService {
  // Check if user has premium access
  static async getUserPremiumStatus(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) return null;

    const tier = user.premiumTier || 'free';
    const tierConfig = PREMIUM_TIERS[tier as keyof typeof PREMIUM_TIERS];
    
    return {
      tier,
      isPremium: tier !== 'free',
      isUnlimited: tierConfig?.dailySpinLimit === -1,
      dailySpinLimit: tierConfig?.dailySpinLimit || 5,
      features: tierConfig?.features || [],
      price: tierConfig?.price || 0
    };
  }

  // Advanced analytics for premium users
  static async getAdvancedAnalytics(userId: string, timeRange: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get user's spins for the time range
    const userSpins = await db
      .select({
        spinId: spins.id,
        albumId: spins.albumId,
        startedAt: spins.startedAt,
        listenedAt: spins.listenedAt,
        mode: spins.mode,
        albumName: albums.name,
        albumArtist: albums.artist,
        albumYear: albums.year,
        albumGenres: albums.genres
      })
      .from(spins)
      .innerJoin(albums, eq(spins.albumId, albums.id))
      .where(
        and(
          eq(spins.userId, userId),
          gte(spins.startedAt, startDate)
        )
      )
      .orderBy(desc(spins.startedAt));

    // Calculate analytics metrics
    const totalSpins = userSpins.length;
    const completedListens = userSpins.filter(spin => spin.listenedAt).length;
    const completionRate = totalSpins > 0 ? (completedListens / totalSpins) * 100 : 0;

    // Listening patterns by hour
    const hourlyPattern = Array(24).fill(0);
    userSpins.forEach(spin => {
      const hour = new Date(spin.startedAt).getHours();
      hourlyPattern[hour]++;
    });

    // Genre analysis
    const genreCount: Record<string, number> = {};
    userSpins.forEach(spin => {
      if (spin.albumGenres && Array.isArray(spin.albumGenres)) {
        spin.albumGenres.forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    const topGenres = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count }));

    // Decade analysis
    const decadeCount: Record<string, number> = {};
    userSpins.forEach(spin => {
      if (spin.albumYear) {
        const decade = `${Math.floor(spin.albumYear / 10) * 10}s`;
        decadeCount[decade] = (decadeCount[decade] || 0) + 1;
      }
    });

    const topDecades = Object.entries(decadeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([decade, count]) => ({ decade, count }));

    // Discovery modes usage
    const modeCount: Record<string, number> = {};
    userSpins.forEach(spin => {
      modeCount[spin.mode] = (modeCount[spin.mode] || 0) + 1;
    });

    // Weekly activity pattern
    const weeklyPattern = Array(7).fill(0); // Sunday = 0
    userSpins.forEach(spin => {
      const dayOfWeek = new Date(spin.startedAt).getDay();
      weeklyPattern[dayOfWeek]++;
    });

    // Monthly progression (for longer time ranges)
    const monthlyProgression: Array<{ month: string; spins: number; completed: number }> = [];
    if (timeRange === 'year') {
      for (let month = 0; month < 12; month++) {
        const monthSpins = userSpins.filter(spin => {
          const spinDate = new Date(spin.startedAt);
          return spinDate.getMonth() === month;
        });
        
        monthlyProgression.push({
          month: new Date(now.getFullYear(), month, 1).toLocaleDateString('en', { month: 'short' }),
          spins: monthSpins.length,
          completed: monthSpins.filter(spin => spin.listenedAt).length
        });
      }
    }

    // Recent discoveries summary
    const recentDiscoveries = userSpins.slice(0, 10).map(spin => ({
      albumName: spin.albumName,
      artist: spin.albumArtist,
      year: spin.albumYear,
      discoveredAt: spin.startedAt,
      completed: !!spin.listenedAt,
      mode: spin.mode
    }));

    return {
      timeRange,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      overview: {
        totalSpins,
        completedListens,
        completionRate: Math.round(completionRate * 100) / 100,
        uniqueAlbums: new Set(userSpins.map(spin => spin.albumId)).size,
        uniqueArtists: new Set(userSpins.map(spin => spin.albumArtist)).size
      },
      patterns: {
        hourly: hourlyPattern.map((count, hour) => ({ hour, count })),
        weekly: weeklyPattern.map((count, day) => ({ 
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day], 
          count 
        })),
        monthly: monthlyProgression
      },
      preferences: {
        topGenres,
        topDecades,
        discoveryModes: Object.entries(modeCount).map(([mode, count]) => ({ mode, count }))
      },
      recentDiscoveries
    };
  }

  // Get premium feature usage stats
  static async getPremiumUsageStats(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) return null;

    // Calculate monthly spin usage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlySpins = await db
      .select({ count: count() })
      .from(spins)
      .where(
        and(
          eq(spins.userId, userId),
          gte(spins.startedAt, thirtyDaysAgo)
        )
      );

    const dailyAverage = Math.round((monthlySpins[0]?.count || 0) / 30 * 10) / 10;
    const standardLimitExceeded = (monthlySpins[0]?.count || 0) > (30 * 5); // 5 spins/day for 30 days

    return {
      monthlySpins: monthlySpins[0]?.count || 0,
      dailyAverage,
      standardLimitExceeded,
      premiumTier: user.premiumTier,
      keyboardShortcuts: user.keyboardShortcuts,
      customTheme: user.customTheme,
      isVerifiedCurator: user.isVerifiedCurator
    };
  }

  // Update user premium tier
  static async updateUserPremiumTier(userId: string, tier: 'free' | 'premium' | 'pro') {
    await db
      .update(users)
      .set({ 
        premiumTier: tier,
        dailySpinLimit: PREMIUM_TIERS[tier].dailySpinLimit === -1 ? 999999 : PREMIUM_TIERS[tier].dailySpinLimit
      })
      .where(eq(users.id, userId));

    return await this.getUserPremiumStatus(userId);
  }

  // Check if user can perform premium action
  static async checkPremiumAccess(userId: string, feature: string): Promise<boolean> {
    const status = await this.getUserPremiumStatus(userId);
    if (!status) return false;

    const premiumFeatures = [
      'unlimited_spins',
      'advanced_analytics', 
      'mood_discovery',
      'custom_themes',
      'export_data',
      'ai_recommendations',
      'playlist_integration'
    ];

    if (!premiumFeatures.includes(feature)) return true; // Free feature
    
    return status.isPremium;
  }
}

// API Routes
export async function getPremiumStatus(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await PremiumService.getUserPremiumStatus(userId);
    const usageStats = await PremiumService.getPremiumUsageStats(userId);

    res.json({
      ...status,
      usage: usageStats
    });
  } catch (error) {
    console.error('Error getting premium status:', error);
    res.status(500).json({ error: 'Failed to get premium status' });
  }
}

export async function getAdvancedAnalytics(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check premium access
    const hasAccess = await PremiumService.checkPremiumAccess(userId, 'advanced_analytics');
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Premium feature', 
        message: 'Advanced analytics requires Premium subscription' 
      });
    }

    const { timeRange = 'month' } = req.query;
    const analytics = await PremiumService.getAdvancedAnalytics(
      userId, 
      timeRange as 'week' | 'month' | 'year'
    );

    res.json(analytics);
  } catch (error) {
    console.error('Error getting advanced analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
}

export async function upgradePremium(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { tier, paymentMethod } = req.body;

    if (!['premium', 'pro'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    // In a real app, you'd integrate with Stripe or another payment processor here
    // For now, we'll simulate the upgrade
    console.log(`Simulating premium upgrade for user ${userId} to ${tier} tier`);

    const updatedStatus = await PremiumService.updateUserPremiumTier(userId, tier);

    res.json({
      success: true,
      message: `Successfully upgraded to ${tier}`,
      status: updatedStatus
    });
  } catch (error) {
    console.error('Error upgrading premium:', error);
    res.status(500).json({ error: 'Failed to upgrade premium' });
  }
}

export async function updatePremiumSettings(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { keyboardShortcuts, customTheme } = req.body;

    const updateData: any = {};
    if (typeof keyboardShortcuts === 'boolean') {
      updateData.keyboardShortcuts = keyboardShortcuts;
    }
    if (customTheme) {
      updateData.customTheme = customTheme;
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating premium settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}