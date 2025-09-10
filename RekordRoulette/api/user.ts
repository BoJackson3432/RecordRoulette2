import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const path = req.query.path || req.url.split('?')[0];

    if (path.includes('/me') || path === '/api/user') {
      // User profile with integrated premium status and basic trophies
      const userData = {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: null,
        onboardingCompleted: true,
        streak: { current: 3, longest: 7 },
        // Integrated premium status
        premium: {
          isPremium: false,
          tier: 'hobby',
          spinsRemaining: 5,
          nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        // Basic trophy count
        trophyStats: {
          earned: 2,
          total: 30,
          recentTrophies: [
            { id: 'first-spin', name: 'First Spin', tier: 'bronze', earnedAt: '2024-01-15T10:00:00Z' }
          ]
        }
      };
      
      res.status(200).json(userData);
    } else if (path.includes('/trophies')) {
      // Detailed trophies data
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
    } else if (path.includes('/premium')) {
      // Detailed premium status
      const premiumStatus = {
        isPremium: false,
        tier: 'hobby',
        spinsRemaining: 5,
        dailyLimit: 5,
        nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        features: ['basic_discovery', 'daily_spins']
      };
      res.status(200).json(premiumStatus);
    } else {
      res.status(404).json({ error: 'User route not found' });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
}