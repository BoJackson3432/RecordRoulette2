import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const { type = 'global', category = 'spins' } = req.query;

    // Stub leaderboard data
    const leaderboardData = {
      entries: [
        { id: '1', username: 'MusicLover1', score: 150, rank: 1 },
        { id: '2', username: 'VinylCollector', score: 142, rank: 2 },
        { id: '3', username: 'AlbumHunter', score: 138, rank: 3 },
        { id: user.id, username: user.displayName, score: 25, rank: 15 }
      ],
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