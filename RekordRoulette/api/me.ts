import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // For now, return mock user data to get the app working
    const mockUser = {
      id: 'mock-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
      avatarUrl: null,
      onboardingCompleted: true,
      streak: { current: 0, longest: 0 }
    };

    res.status(200).json(mockUser);
  } catch (error) {
    console.error('API /me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}