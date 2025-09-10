import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const path = req.url.split('?')[0];

    if (path.includes('/can-spin') || req.query.action === 'can-spin') {
      // Check if user can spin
      const canSpinData = {
        canSpin: true,
        spinsRemaining: 5,
        nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isPremium: false
      };
      res.status(200).json(canSpinData);
    } else if (req.method === 'POST') {
      // Create new spin - stub data
      const spin = {
        id: `spin-${Date.now()}`,
        userId: user.id,
        album: {
          id: 'demo-album-spin',
          name: 'Demo Spin Album',
          artist: 'Demo Artist',
          coverUrl: 'https://via.placeholder.com/300x300?text=Spin+Album',
          releaseDate: '2024-01-01',
          genres: ['rock', 'alternative'],
          previewUrl: null,
          spotifyUrl: 'https://open.spotify.com/album/demo'
        },
        mode: req.body?.mode || 'saved',
        createdAt: new Date().toISOString(),
        listened: false
      };

      res.status(200).json(spin);
    } else if (req.method === 'GET') {
      // Default to can-spin check for GET requests
      const canSpinData = {
        canSpin: true,
        spinsRemaining: 5,
        nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isPremium: false
      };
      res.status(200).json(canSpinData);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API /spin error:', error);
    res.status(500).json({ error: 'Failed to handle spin request' });
  }
}