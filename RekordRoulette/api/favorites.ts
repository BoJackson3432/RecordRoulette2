export default function handler(req: any, res: any) {
  try {
    // Check if user is authenticated
    const userId = req.cookies?.user_id;
    if (!userId || !userId.startsWith('spotify-')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Return empty favorites for now
    res.status(200).json([]);
  } catch (error) {
    console.error('Favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
}