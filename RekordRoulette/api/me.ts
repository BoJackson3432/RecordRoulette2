import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUserId } from './auth/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if user is authenticated
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Extract Spotify ID from user ID
    const spotifyId = userId.replace('spotify-', '');
    
    // Return mock user data for now (will connect to database later)
    res.status(200).json({
      id: userId,
      displayName: `Spotify User ${spotifyId.substring(0, 8)}`,
      email: 'user@spotify.com',
      avatarUrl: null,
      onboardingCompleted: true,
      streak: { current: 0, longest: 0 }
    });
  } catch (error) {
    console.error('API /me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}