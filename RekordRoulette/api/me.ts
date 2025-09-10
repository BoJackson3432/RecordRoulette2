export default function handler(req: any, res: any) {
  try {
    // Check if user is authenticated via simple cookie
    const userId = req.cookies.user_id;
    const userName = req.cookies.user_name;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Return user data from cookies
    res.status(200).json({
      id: userId,
      displayName: decodeURIComponent(userName || 'Spotify User'),
      email: 'user@spotify.com',
      avatarUrl: null,
      onboardingCompleted: true,
      streak: { current: 0, longest: 0 }
    });
  } catch (error) {
    console.error('API /me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}