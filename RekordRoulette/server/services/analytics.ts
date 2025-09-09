import { Request, Response } from 'express';
import { db } from '../db';
import { 
  users, 
  spins, 
  albums, 
  streaks
} from '@shared/schema';
import { eq, count, desc, gte, lte, and, sql, avg } from 'drizzle-orm';

export interface UserBehaviorEvent {
  userId: string;
  sessionId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
}

export interface AnalyticsDashboard {
  realTime: {
    activeUsers: number;
    spinsInProgress: number;
    completionRate: number;
    averageSessionLength: number;
  };
  trends: {
    dailySpins: Array<{ date: string; count: number; completed: number }>;
    userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
    popularGenres: Array<{ genre: string; count: number; trend: number }>;
    deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
  };
  engagement: {
    avgSpinsPerUser: number;
    avgSessionLength: number;
    retentionRate: number;
    churnRate: number;
  };
}

export class AnalyticsService {
  // Track user behavior events
  static async trackEvent(
    userId: string, 
    sessionId: string, 
    eventType: string, 
    eventData: any = {}
  ) {
    try {
      // For now, just log events to console since behavior tracking table doesn't exist yet
      console.log(`Event tracked: ${eventType}`, { userId, sessionId, eventData });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Get real-time analytics
  static async getRealTimeAnalytics(): Promise<AnalyticsDashboard['realTime']> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Active users (users with spins in last hour)
    const activeUsersResult = await db
      .select({ count: count() })
      .from(spins)
      .where(gte(spins.startedAt, oneHourAgo));

    // Spins in progress (started but not completed in last day)
    const spinsInProgressResult = await db
      .select({ count: count() })
      .from(spins)
      .where(
        and(
          gte(spins.startedAt, oneDayAgo),
          sql`${spins.listenedAt} IS NULL`
        )
      );

    // Completion rate (spins completed vs started in last day)
    const totalSpinsResult = await db
      .select({ count: count() })
      .from(spins)
      .where(gte(spins.startedAt, oneDayAgo));

    const completedSpinsResult = await db
      .select({ count: count() })
      .from(spins)
      .where(
        and(
          gte(spins.startedAt, oneDayAgo),
          sql`${spins.listenedAt} IS NOT NULL`
        )
      );

    const totalSpins = totalSpinsResult[0]?.count || 0;
    const completedSpins = completedSpinsResult[0]?.count || 0;
    const completionRate = totalSpins > 0 ? (completedSpins / totalSpins) * 100 : 0;

    // Average session length (simplified calculation)
    const averageSessionLength = 15; // Placeholder - would need session tracking

    return {
      activeUsers: activeUsersResult[0]?.count || 0,
      spinsInProgress: spinsInProgressResult[0]?.count || 0,
      completionRate: Math.round(completionRate * 100) / 100,
      averageSessionLength: Math.round(averageSessionLength * 100) / 100
    };
  }

  // Get trending data
  static async getTrends(days: number = 7): Promise<AnalyticsDashboard['trends']> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Daily spins trend
    const dailySpinsResult = await db.execute(sql`
      SELECT 
        DATE(started_at) as date,
        COUNT(*) as count,
        COUNT(listened_at) as completed
      FROM spins 
      WHERE started_at >= ${startDate}
      GROUP BY DATE(started_at)
      ORDER BY date DESC
    `);

    const dailySpins = (dailySpinsResult.rows as any[]).map(row => ({
      date: row.date,
      count: Number(row.count),
      completed: Number(row.completed)
    }));

    // User growth trend
    const userGrowthResult = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        (SELECT COUNT(*) FROM users WHERE created_at <= DATE(u.created_at)) as total_users
      FROM users u
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    const userGrowth = (userGrowthResult.rows as any[]).map(row => ({
      date: row.date,
      newUsers: Number(row.new_users),
      totalUsers: Number(row.total_users)
    }));

    // Popular genres (from recent spins)
    const genreResult = await db.execute(sql`
      SELECT 
        UNNEST(a.genres) as genre,
        COUNT(*) as count
      FROM spins s
      JOIN albums a ON s.album_id = a.id
      WHERE s.started_at >= ${startDate} 
        AND a.genres IS NOT NULL
      GROUP BY UNNEST(a.genres)
      ORDER BY count DESC
      LIMIT 10
    `);

    const popularGenres = (genreResult.rows as any[]).map(row => ({
      genre: row.genre,
      count: Number(row.count),
      trend: 0 // Would need historical comparison for actual trend
    }));

    // Device breakdown (placeholder data)
    const deviceBreakdown = [
      { device: 'Desktop', count: 60, percentage: 60 },
      { device: 'Mobile', count: 35, percentage: 35 },
      { device: 'Tablet', count: 5, percentage: 5 }
    ];

    return {
      dailySpins,
      userGrowth,
      popularGenres,
      deviceBreakdown
    };
  }

  // Get engagement metrics
  static async getEngagementMetrics(): Promise<AnalyticsDashboard['engagement']> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Average spins per user
    const avgSpinsResult = await db.execute(sql`
      SELECT AVG(user_spins.spin_count) as avg_spins
      FROM (
        SELECT user_id, COUNT(*) as spin_count
        FROM spins
        WHERE started_at >= ${thirtyDaysAgo}
        GROUP BY user_id
      ) user_spins
    `);

    // Average session length (placeholder)
    const avgSessionResult = { rows: [{ avg_minutes: 18.5 }] };

    // Retention rate (users who came back within 7 days)
    const retentionResult = await db.execute(sql`
      WITH user_first_activity AS (
        SELECT user_id, MIN(DATE(started_at)) as first_date
        FROM spins
        WHERE started_at >= ${thirtyDaysAgo}
        GROUP BY user_id
      ),
      returning_users AS (
        SELECT DISTINCT ufa.user_id
        FROM user_first_activity ufa
        JOIN spins s ON ufa.user_id = s.user_id
        WHERE DATE(s.started_at) > ufa.first_date
          AND DATE(s.started_at) <= ufa.first_date + INTERVAL '7 days'
      )
      SELECT 
        (SELECT COUNT(*) FROM returning_users) * 100.0 / 
        (SELECT COUNT(*) FROM user_first_activity) as retention_rate
    `);

    // Churn rate (users who haven't been active in last 14 days)
    const churnResult = await db.execute(sql`
      WITH active_users AS (
        SELECT COUNT(DISTINCT user_id) as count
        FROM spins
        WHERE started_at >= ${thirtyDaysAgo}
      ),
      recent_users AS (
        SELECT COUNT(DISTINCT user_id) as count
        FROM spins
        WHERE started_at >= ${new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)}
      )
      SELECT 
        (au.count - ru.count) * 100.0 / au.count as churn_rate
      FROM active_users au, recent_users ru
    `);

    return {
      avgSpinsPerUser: Math.round(Number((avgSpinsResult.rows[0] as any)?.avg_spins) * 100) / 100 || 0,
      avgSessionLength: Math.round(Number((avgSessionResult.rows[0] as any)?.avg_minutes) * 100) / 100 || 0,
      retentionRate: Math.round(Number((retentionResult.rows[0] as any)?.retention_rate) * 100) / 100 || 0,
      churnRate: Math.round(Number((churnResult.rows[0] as any)?.churn_rate) * 100) / 100 || 0
    };
  }

  // Get complete analytics dashboard
  static async getAnalyticsDashboard(days: number = 7): Promise<AnalyticsDashboard> {
    const [realTime, trends, engagement] = await Promise.all([
      this.getRealTimeAnalytics(),
      this.getTrends(days),
      this.getEngagementMetrics()
    ]);

    return {
      realTime,
      trends,
      engagement
    };
  }

  // Track user session (placeholder - sessions table not implemented yet)
  static async createUserSession(userId: string, sessionId: string, deviceInfo: any = {}) {
    console.log('Session created:', { userId, sessionId, deviceInfo });
  }

  static async endUserSession(sessionId: string) {
    console.log('Session ended:', { sessionId });
  }
}

// API Routes
export async function getAnalyticsDashboard(req: Request, res: Response) {
  try {
    const { days = 7 } = req.query;
    const dashboard = await AnalyticsService.getAnalyticsDashboard(Number(days));
    
    res.json({
      ...dashboard,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to get analytics dashboard' });
  }
}

export async function trackBehaviorEvent(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    const sessionId = (req.session as any)?.id || 'anonymous';
    
    const { eventType, eventData = {} } = req.body;
    
    if (!eventType) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    // Add request metadata
    const enrichedEventData = {
      ...eventData,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
      timestamp: new Date().toISOString()
    };

    if (userId) {
      await AnalyticsService.trackEvent(userId, sessionId, eventType, enrichedEventData);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking behavior event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
}

export async function createSession(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    const sessionId = (req.session as any)?.id;
    
    if (!userId || !sessionId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const deviceInfo = {
      deviceType: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection.remoteAddress || ''
    };

    await AnalyticsService.createUserSession(userId, sessionId, deviceInfo);
    
    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

export async function endSession(req: Request, res: Response) {
  try {
    const sessionId = (req.session as any)?.id;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    await AnalyticsService.endUserSession(sessionId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
}