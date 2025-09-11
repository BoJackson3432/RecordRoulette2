import { requireAuthentication } from '../RekordRoulette/shared/auth';

export default function handler(req: any, res: any) {
  try {
    // Verify HMAC authentication
    const user = requireAuthentication(req, res);
    if (!user) {
      // requireAuthentication already sent error response
      return;
    }

    // Mock response for marking as listened
    res.status(200).json({
      ok: true,
      streak: {
        current: Math.floor(Math.random() * 10) + 1,
        longest: Math.floor(Math.random() * 20) + 5
      }
    });
  } catch (error) {
    console.error('Listened error:', error);
    res.status(500).json({ error: 'Failed to mark as listened' });
  }
}