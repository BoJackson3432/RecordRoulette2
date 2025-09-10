export default function handler(req: any, res: any) {
  try {
    // Check if user is authenticated
    const userId = req.cookies?.user_id;
    if (!userId || !userId.startsWith('spotify-')) {
      return res.status(401).json({ error: 'Not authenticated' });
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