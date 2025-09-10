export default function handler(req: any, res: any) {
  try {
    // Log request info for debugging
    console.log('API /me called, cookies:', req.cookies);
    
    // Check if user is authenticated via simple cookie
    const userId = req.cookies?.user_id;
    const userName = req.cookies?.user_name;
    
    console.log('Auth check - userId:', userId, 'userName:', userName);
    
    if (!userId || !userId.startsWith('spotify-')) {
      console.log('Not authenticated - returning 401');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Return user data from cookies
    const userData = {
      id: userId,
      displayName: decodeURIComponent(userName || 'Spotify User'),
      email: 'user@spotify.com',
      avatarUrl: null,
      onboardingCompleted: true,
      streak: { current: 0, longest: 0 }
    };
    
    console.log('Returning user data:', userData);
    res.status(200).json(userData);
  } catch (error) {
    console.error('API /me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}