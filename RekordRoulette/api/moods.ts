import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    // Stub mood data for immediate deployment
    const moods = [
      { id: 'energetic', name: 'Energetic', emoji: '⚡', description: 'High energy music' },
      { id: 'chill', name: 'Chill', emoji: '😌', description: 'Relaxing vibes' },
      { id: 'focused', name: 'Focused', emoji: '🎯', description: 'Focus music' },
      { id: 'nostalgic', name: 'Nostalgic', emoji: '🌅', description: 'Classic hits' }
    ];

    res.status(200).json(moods);
  } catch (error) {
    console.error('API /moods error:', error);
    res.status(500).json({ error: 'Failed to get moods' });
  }
}