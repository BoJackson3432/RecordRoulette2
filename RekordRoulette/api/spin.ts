import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    if (req.method === 'POST') {
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
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API /spin error:', error);
    res.status(500).json({ error: 'Failed to create spin' });
  }
}