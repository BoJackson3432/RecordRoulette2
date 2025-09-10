import { requireAuthentication } from '../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    if (req.method === 'POST') {
      const { competition, rank, score, platform } = req.body;

      // Generate share content based on client expectations
      const shareContent = {
        title: `🏆 Ranked #${rank} on RecordRoulette!`,
        description: `I'm #${rank} with ${score} spins in the ${competition.replace('_', ' ')} competition! Join me and discover amazing music! 🎵`,
        shareUrl: `https://www.recordroulette.com/leaderboards?competition=${competition}`,
        hashtags: ['RecordRoulette', 'MusicDiscovery', 'VinylRoulette', 'SpotifyMusic']
      };

      res.status(200).json(shareContent);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API /leaderboards/share error:', error);
    res.status(500).json({ error: 'Failed to generate share content' });
  }
}