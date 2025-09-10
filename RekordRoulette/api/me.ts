import { createHmac } from 'crypto';

export default function handler(req: any, res: any) {
  try {
    // Log request info for debugging
    console.log('API /me called, cookies:', req.cookies);
    
    // Check if user is authenticated via secure session
    const userId = req.cookies?.user_id;
    const userName = req.cookies?.user_name;
    const sessionToken = req.cookies?.session_token;
    
    console.log('Auth check - userId:', userId, 'userName:', userName, 'hasToken:', !!sessionToken);
    
    if (!userId || !userId.startsWith('spotify-') || !sessionToken) {
      console.log('Not authenticated - missing credentials');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Verify cryptographically signed session token
    try {
      const [payloadB64, signatureB64] = sessionToken.split('.');
      if (!payloadB64 || !signatureB64) {
        console.log('Invalid token format - missing parts');
        return res.status(401).json({ error: 'Invalid token format' });
      }
      
      // Verify signature
      const secret = process.env.SESSION_SECRET || 'fallback-dev-secret-change-in-production';
      const expectedSignature = createHmac('sha256', secret).update(payloadB64).digest('base64url');
      
      if (signatureB64 !== expectedSignature) {
        console.log('Invalid token signature');
        return res.status(401).json({ error: 'Invalid token signature' });
      }
      
      // Decode and validate payload
      const sessionData = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
      
      if (sessionData.userId !== userId) {
        console.log('Token user ID mismatch');
        return res.status(401).json({ error: 'Token user mismatch' });
      }
      
      // Check expiration (exp is in seconds)
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (sessionData.exp && nowSeconds > sessionData.exp) {
        console.log('Token expired');
        return res.status(401).json({ error: 'Token expired' });
      }
      
    } catch (error) {
      console.log('Token validation error:', error.message);
      return res.status(401).json({ error: 'Invalid token' });
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