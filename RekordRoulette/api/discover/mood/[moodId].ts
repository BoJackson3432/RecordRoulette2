import { requireAuthentication } from '../../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const { moodId } = req.query;

    // Stub album discovery for immediate deployment
    const album = {
      id: 'demo-album',
      name: 'Demo Album',
      artist: 'Demo Artist',
      coverUrl: 'https://via.placeholder.com/300x300?text=Album',
      releaseDate: '2024-01-01',
      genres: ['electronic', 'ambient'],
      previewUrl: null
    };

    res.status(200).json({ album, source: `mood:${moodId}` });
  } catch (error) {
    console.error('API /discover/mood error:', error);
    res.status(500).json({ error: 'Failed to discover mood album' });
  }
}