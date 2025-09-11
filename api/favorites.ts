import { requireAuthentication } from '../RekordRoulette/shared/auth';

export default function handler(req: any, res: any) {
  try {
    // Verify HMAC authentication
    const user = requireAuthentication(req, res);
    if (!user) {
      // requireAuthentication already sent error response
      return;
    }

    // Return empty favorites for now
    res.status(200).json([]);
  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
}