import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    // Stub trophies data
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
      },
      {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Maintained a 7-day listening streak',
        tier: 'gold',
        category: 'streak',
        earned: false,
        progress: { current: 3, required: 7 }
      }
    ];

    res.status(200).json(trophies);
  } catch (error) {
    console.error('API /trophies error:', error);
    res.status(500).json({ error: 'Failed to get trophies' });
  }
}