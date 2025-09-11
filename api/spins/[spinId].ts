import { requireAuthentication } from '../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const { spinId } = req.query;

    // Stub spin details
    const spinDetails = {
      id: spinId,
      userId: user.id,
      album: {
        id: 'demo-album-details',
        name: 'Demo Album Details',
        artist: 'Demo Artist',
        coverUrl: 'https://via.placeholder.com/300x300?text=Details',
        releaseDate: '2024-01-01',
        genres: ['electronic', 'ambient'],
        previewUrl: null,
        spotifyUrl: 'https://open.spotify.com/album/demo'
      },
      mode: 'saved',
      createdAt: new Date().toISOString(),
      listened: false
    };

    res.status(200).json(spinDetails);
  } catch (error) {
    console.error('API /spins/[spinId] error:', error);
    res.status(500).json({ error: 'Failed to get spin details' });
  }
}