import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const { type = 'global', category = 'spins' } = req.query;

    // Stub leaderboard data matching client expectations
    const leaderboardData = {
      leaderboard: [
        { id: '1', displayName: 'MusicLover1', avatarUrl: 'https://via.placeholder.com/32', score: 150, rank: 1, change: 0, isCurrentUser: false },
        { id: '2', displayName: 'VinylCollector', avatarUrl: 'https://via.placeholder.com/32', score: 142, rank: 2, change: 1, isCurrentUser: false },
        { id: '3', displayName: 'AlbumHunter', avatarUrl: 'https://via.placeholder.com/32', score: 138, rank: 3, change: -1, isCurrentUser: false },
        { id: user.id, displayName: user.displayName, avatarUrl: 'https://via.placeholder.com/32', score: 25, rank: 15, change: 2, isCurrentUser: true }
      ],
      competition: {
        name: `${type} ${category}`,
        description: `${type} leaderboard for ${category}`,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      userRank: 15,
      totalParticipants: 1247,
      category,
      type
    };

    res.status(200).json(leaderboardData);
  } catch (error) {
    console.error('API /leaderboards error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard data' });
  }
}