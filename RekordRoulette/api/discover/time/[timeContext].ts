import { requireAuthentication } from '../../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const { timeContext } = req.query;

    // Stub album discovery for immediate deployment
    const album = {
      id: 'demo-time-album',
      name: 'Perfect Time Album',
      artist: 'Time Artist',
      coverUrl: 'https://via.placeholder.com/300x300?text=Time+Album',
      releaseDate: '2024-01-01',
      genres: ['ambient', 'electronic'],
      previewUrl: null
    };

    res.status(200).json({ album, source: `time:${timeContext}` });
  } catch (error) {
    console.error('API /discover/time error:', error);
    res.status(500).json({ error: 'Failed to discover time album' });
  }
}