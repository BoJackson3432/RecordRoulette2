import { requireAuthentication } from '../shared/auth';

export default function handler(req: any, res: any) {
  try {
    // Log request info for debugging (no sensitive data)
    console.log('API /me called, has cookies:', Object.keys(req.cookies || {}));
    
    // Verify HMAC authentication
    const user = requireAuthentication(req, res);
    if (!user) {
      // requireAuthentication already sent error response
      return;
    }

    // Return user data with additional profile information
    const userData = {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
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