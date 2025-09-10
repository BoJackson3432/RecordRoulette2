import { requireAuthentication } from '../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const { leaderboards } = req.query;
    const route = Array.isArray(leaderboards) ? leaderboards.join('/') : leaderboards || '';
    const { type = 'global', category = 'spins' } = req.query;

    if (route === 'ranking') {
      // User ranking data
      const rankingData = {
        globalRank: 15,
        totalUsers: 1247,
        score: 25,
        weeklyRank: 8,
        weeklyScore: 12
      };
      res.status(200).json(rankingData);
    } else if (route === 'share' && req.method === 'POST') {
      // Generate share content
      const { competition, rank, score, platform } = req.body;
      const shareContent = {
        title: `🏆 Ranked #${rank} on RecordRoulette!`,
        description: `I'm #${rank} with ${score} spins in the ${competition.replace('_', ' ')} competition! Join me and discover amazing music! 🎵`,
        shareUrl: `https://www.recordroulette.com/leaderboards?competition=${competition}`,
        hashtags: ['RecordRoulette', 'MusicDiscovery', 'VinylRoulette', 'SpotifyMusic']
      };
      res.status(200).json(shareContent);
    } else {
      // Main leaderboard data
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
    }
  } catch (error) {
    console.error('Leaderboards API error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard data' });
  }
}