import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { getSessionUserId } from './auth/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if user is authenticated
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get real user data with streak from database
    const userWithStreak = await storage.getUserWithStreak(userId);
    if (!userWithStreak) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: userWithStreak.id,
      displayName: userWithStreak.displayName,
      email: userWithStreak.email,
      avatarUrl: userWithStreak.avatarUrl,
      onboardingCompleted: userWithStreak.onboardingCompleted,
      streak: userWithStreak.streak || { current: 0, longest: 0 }
    });
  } catch (error) {
    console.error('API /me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}