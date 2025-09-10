export default function handler(req: any, res: any) {
  try {
    // Check if user is authenticated
    const userId = req.cookies?.user_id;
    if (!userId || !userId.startsWith('spotify-')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Mock album data for spinning
    const mockAlbums = [
      {
        id: 'album1',
        name: 'Random Discovery',
        artist: 'Test Artist',
        year: 2023,
        coverUrl: 'https://via.placeholder.com/300x300',
        deepLink: 'https://open.spotify.com/album/test'
      },
      {
        id: 'album2', 
        name: 'Mystery Album',
        artist: 'Unknown Band',
        year: 2022,
        coverUrl: 'https://via.placeholder.com/300x300',
        deepLink: 'https://open.spotify.com/album/test2'
      }
    ];

    // Pick random album
    const randomAlbum = mockAlbums[Math.floor(Math.random() * mockAlbums.length)];
    
    // Create mock spin
    const spin = {
      spinId: `spin-${Date.now()}`,
      album: randomAlbum,
      mode: req.body?.mode || 'saved'
    };

    res.status(200).json(spin);
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ error: 'Failed to create spin' });
  }
}