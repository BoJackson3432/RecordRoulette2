import { requireAuthentication } from '../../RekordRoulette/shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const { user: userPath } = req.query;
    const route = Array.isArray(userPath) ? userPath.join('/') : userPath || '';

    if (route === 'premium' || route === 'premium/status') {
      // Premium status endpoint  
      const premiumStatus = {
        isPremium: false,
        tier: 'hobby',
        spinsRemaining: 5,
        dailyLimit: 5,
        nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        features: ['basic_discovery', 'daily_spins']
      };
      res.status(200).json(premiumStatus);
    } else if (route === 'trophies') {
      // Trophies endpoint
      const trophies = [
        {
          id: 'first-spin',
          name: 'First Spin',
          description: 'Completed your first album spin',
          tier: 'bronze',
          category: 'discovery',
          earned: true,
          earnedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'music-explorer',
          name: 'Music Explorer',
          description: 'Discovered 10 new albums',
          tier: 'silver',
          category: 'discovery',
          earned: true,
          earnedAt: '2024-01-20T15:30:00Z'
        }
      ];
      res.status(200).json(trophies);
    } else {
      // Main user profile endpoint (default for /api/user)
      const userData = {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: null,
        onboardingCompleted: true,
        streak: { current: 3, longest: 7 },
        premium: {
          isPremium: false,
          tier: 'hobby',
          spinsRemaining: 5,
          nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
      res.status(200).json(userData);
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
}