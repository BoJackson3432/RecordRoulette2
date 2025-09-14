import { Request, Response } from 'express';
import { db } from './db';
import { referrals, users } from '@shared/schema';
import { eq, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Extended Request interface for authenticated routes
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    displayName?: string;
    email?: string;
  };
}

// Generate a unique referral code
export function generateReferralCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  const userHash = userId.slice(-4);
  return `RR${userHash}${timestamp}${randomStr}`.toUpperCase();
}

// Referral tiers and rewards
export const REFERRAL_TIERS = {
  BRONZE: { min: 1, max: 4, badge: '🥉', title: 'Bronze Ambassador', spins: 5 },
  SILVER: { min: 5, max: 9, badge: '🥈', title: 'Silver Ambassador', spins: 15 },
  GOLD: { min: 10, max: 19, badge: '🥇', title: 'Gold Ambassador', spins: 25 },
  PLATINUM: { min: 20, max: Infinity, badge: '💎', title: 'Platinum Ambassador', spins: 50 }
};

export function getReferralTier(referralCount: number) {
  for (const [tier, config] of Object.entries(REFERRAL_TIERS)) {
    if (referralCount >= config.min && referralCount <= config.max) {
      return { tier, ...config };
    }
  }
  return { tier: 'NONE', badge: '', title: 'Discoverer', spins: 0, min: 0, max: 0 };
}

// API Endpoints
export async function getUserReferralCode(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user already has a referral code
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (existingUser?.referralCode) {
      return res.json({ code: existingUser.referralCode });
    }

    // Generate new referral code
    const newCode = generateReferralCode(userId);
    
    await db
      .update(users)
      .set({ referralCode: newCode })
      .where(eq(users.id, userId));

    res.json({ code: newCode });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
}

export async function getReferralStats(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get referral count and list
    const referralData = await db
      .select({
        id: referrals.id,
        refereeId: referrals.refereeId,
        createdAt: referrals.createdAt,
        codeUsed: referrals.codeUsed,
        rewardClaimed: referrals.rewardClaimed,
        referredUserEmail: users.email,
        referredUserName: users.displayName
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.refereeId, users.id))
      .where(eq(referrals.referrerId, userId));

    const totalReferrals = referralData.length;
    const successfulReferrals = referralData.filter(r => r.rewardClaimed).length;
    const pendingReferrals = referralData.filter(r => !r.rewardClaimed).length;

    // Get current tier
    const currentTier = getReferralTier(successfulReferrals);
    const nextTier = Object.values(REFERRAL_TIERS).find(tier => tier.min > successfulReferrals);

    res.json({
      stats: {
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        currentTier: {
          name: currentTier.tier,
          title: currentTier.title,
          badge: currentTier.badge,
          bonusSpins: currentTier.spins
        },
        nextTier: nextTier ? {
          name: Object.keys(REFERRAL_TIERS).find(key => REFERRAL_TIERS[key as keyof typeof REFERRAL_TIERS] === nextTier),
          title: nextTier.title,
          badge: nextTier.badge,
          required: nextTier.min - successfulReferrals
        } : null
      },
      referrals: referralData.map(r => ({
        id: r.id,
        referredUserEmail: r.referredUserEmail,
        referredUserName: r.referredUserName,
        createdAt: r.createdAt,
        rewardClaimed: r.rewardClaimed
      }))
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({ error: 'Failed to get referral stats' });
  }
}

export async function processReferralSignup(referralCode: string, newUserId: string) {
  try {
    if (!referralCode) return;

    // Find the referrer
    const [referrer] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));

    if (!referrer) {
      console.log('Referral code not found:', referralCode);
      return;
    }

    // Create referral record
    await db.insert(referrals).values({
      referrerId: referrer.id,
      refereeId: newUserId,
      codeUsed: referralCode,
      rewardClaimed: false
    });

    // Award bonus spins to referrer by increasing total referrals
    await db
      .update(users)
      .set({
        totalReferrals: referrer.totalReferrals + 1
      })
      .where(eq(users.id, referrer.id));

    console.log(`Processed referral: ${referrer.displayName} referred user ${newUserId}`);

    console.log(`Processed referral: ${referrer.displayName} referred user ${newUserId}`);
  } catch (error) {
    console.error('Error processing referral signup:', error);
  }
}


export async function shareReferral(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { platform } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's referral code
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user?.referralCode) {
      return res.status(400).json({ error: 'No referral code found' });
    }

    // Generate share URL
    const baseUrl = process.env.FRONTEND_URL || req.headers.origin;
    const shareUrl = `${baseUrl}/?ref=${user.referralCode}`;

    // Platform-specific share content
    const shareContent = {
      instagram: {
        text: `🎵 Just discovered RecordRoulette - the most addictive way to rediscover your music library! Join me and get bonus spins: ${shareUrl} #RecordRoulette #MusicDiscovery`,
        hashtags: ['RecordRoulette', 'MusicDiscovery', 'Spotify', 'VinylVibes']
      },
      tiktok: {
        text: `POV: You found the perfect app for music lovers 🎵 RecordRoulette turns your library into a game! Use my link for bonus spins: ${shareUrl}`,
        hashtags: ['RecordRoulette', 'MusicTok', 'SpotifyFinds', 'MusicDiscovery']
      },
      twitter: {
        text: `🎵 Loving @RecordRoulette - it's like vinyl roulette for your digital music! Rediscovering forgotten gems in my library. Join me: ${shareUrl}`,
        hashtags: ['RecordRoulette', 'MusicDiscovery']
      },
      general: {
        text: `Check out RecordRoulette - discover music in your library like never before! ${shareUrl}`,
        hashtags: ['RecordRoulette']
      }
    };

    const content = shareContent[platform as keyof typeof shareContent] || shareContent.general;

    res.json({
      shareUrl,
      content: content.text,
      hashtags: content.hashtags
    });
  } catch (error) {
    console.error('Error creating share content:', error);
    res.status(500).json({ error: 'Failed to create share content' });
  }
}