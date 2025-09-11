import { requireAuthentication } from '../../RekordRoulette/shared/auth.js';

export default function handler(req: any, res: any) {
  try {
    // Verify HMAC authentication
    const user = requireAuthentication(req, res);
    if (!user) {
      // requireAuthentication already sent error response
      return;
    }

    // Mock spin history
    const mockSpins = [
      {
        id: 'spin-1',
        startedAt: new Date().toISOString(),
        listenedAt: new Date().toISOString(),
        album: {
          id: 'album1',
          name: 'Previous Discovery',
          artist: 'Some Artist',
          year: 2023,
          coverUrl: 'https://via.placeholder.com/150x150',
          deepLink: 'https://open.spotify.com/album/test'
        }
      }
    ];

    res.status(200).json(mockSpins);
  } catch (error) {
    console.error('Profile spins error:', error);
    res.status(500).json({ error: 'Failed to get spins' });
  }
}