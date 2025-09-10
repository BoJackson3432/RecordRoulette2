import { requireAuthentication } from '../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    // Stub preferences for immediate deployment
    const preferences = [
      { id: 'chill', name: 'Chill', emoji: '😌' },
      { id: 'energetic', name: 'Energetic', emoji: '⚡' }
    ];

    res.status(200).json(preferences);
  } catch (error) {
    console.error('API /moods/preferences error:', error);
    res.status(500).json({ error: 'Failed to get mood preferences' });
  }
}