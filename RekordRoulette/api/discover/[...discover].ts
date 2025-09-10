import { requireAuthentication } from '../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    const { discover } = req.query;
    const route = Array.isArray(discover) ? discover.join('/') : discover || '';

    if (route === 'moods' || route.startsWith('moods')) {
      // Handle moods and mood preferences
      if (route === 'moods/preferences') {
        res.status(200).json({
          selectedMoods: ['happy', 'energetic'],
          defaultMood: 'happy'
        });
      } else {
        // Available moods
        const moods = [
          { id: 'happy', name: 'Happy', color: '#FFD700', description: 'Upbeat and joyful music' },
          { id: 'sad', name: 'Sad', color: '#6495ED', description: 'Melancholic and emotional' },
          { id: 'energetic', name: 'Energetic', color: '#FF6347', description: 'High-energy and motivating' },
          { id: 'chill', name: 'Chill', color: '#98FB98', description: 'Relaxed and laid-back' },
          { id: 'focus', name: 'Focus', color: '#DDA0DD', description: 'Perfect for concentration' }
        ];
        res.status(200).json(moods);
      }
    } else if (route.startsWith('mood/')) {
      // Discover albums by mood ID
      const moodId = route.split('/')[1];
      const album = {
        id: `mood-${moodId}-album`,
        name: `${moodId.charAt(0).toUpperCase() + moodId.slice(1)} Discovery`,
        artist: 'Mood Artist',
        coverUrl: `https://via.placeholder.com/300x300?text=${moodId.toUpperCase()}`,
        releaseDate: '2024-01-01',
        genres: [moodId, 'discovery'],
        spotifyUrl: 'https://open.spotify.com/album/mood-demo'
      };
      res.status(200).json(album);
    } else if (route.startsWith('time/')) {
      // Discover albums by time context
      const timeContext = route.split('/')[1];
      const album = {
        id: `time-${timeContext}-album`,
        name: `${timeContext.charAt(0).toUpperCase() + timeContext.slice(1)} Vibes`,
        artist: 'Time Artist',
        coverUrl: `https://via.placeholder.com/300x300?text=${timeContext.toUpperCase()}`,
        releaseDate: '2024-01-01',
        genres: [timeContext, 'time-based'],
        spotifyUrl: 'https://open.spotify.com/album/time-demo'
      };
      res.status(200).json(album);
    } else {
      res.status(404).json({ error: 'Discovery route not found' });
    }
  } catch (error) {
    console.error('Discovery API error:', error);
    res.status(500).json({ error: 'Failed to get discovery data' });
  }
}