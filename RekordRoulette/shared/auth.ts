import { createHmac } from 'crypto';

export interface AuthenticatedUser {
  id: string;
  displayName: string;
  email: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Verifies HMAC authentication from request cookies
 * @param cookies - Request cookies object
 * @returns AuthResult with user data if authenticated, error if not
 */
export function verifyAuthentication(cookies: Record<string, string>): AuthResult {
  try {
    // Check if user is authenticated via secure session
    const userId = cookies?.user_id;
    const userName = cookies?.user_name;
    const sessionToken = cookies?.session_token;
    
    console.log('Auth check - userId:', userId, 'userName:', userName, 'hasToken:', !!sessionToken);
    
    if (!userId || !userId.startsWith('spotify-') || !sessionToken) {
      console.log('Not authenticated - missing credentials');
      return { success: false, error: 'Not authenticated' };
    }
    
    // Verify cryptographically signed session token
    try {
      const [payloadB64, signatureB64] = sessionToken.split('.');
      if (!payloadB64 || !signatureB64) {
        console.log('Invalid token format - missing parts');
        return { success: false, error: 'Invalid token format' };
      }
      
      // Verify signature  
      const secret = process.env.SESSION_SECRET;
      
      if (!secret) {
        console.error('SESSION_SECRET environment variable is required');
        return { success: false, error: 'Server configuration error' };
      }
      
      const expectedSignature = createHmac('sha256', secret).update(payloadB64).digest('base64url');
      
      if (signatureB64 !== expectedSignature) {
        console.log('Invalid token signature');
        return { success: false, error: 'Invalid token signature' };
      }
      
      // Decode and validate payload
      const sessionData = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
      
      if (sessionData.userId !== userId) {
        console.log('Token user ID mismatch');
        return { success: false, error: 'Token user mismatch' };
      }
      
      // Check expiration (exp is in seconds)
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (sessionData.exp && nowSeconds > sessionData.exp) {
        console.log('Token expired');
        return { success: false, error: 'Token expired' };
      }
      
    } catch (error) {
      console.log('Token validation error - no sensitive data logged');
      return { success: false, error: 'Invalid token' };
    }

    // Return user data from cookies
    const user: AuthenticatedUser = {
      id: userId,
      displayName: decodeURIComponent(userName || 'Spotify User'),
      email: 'user@spotify.com'
    };
    
    console.log('Authentication successful for user:', user.id);
    return { success: true, user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Middleware-style authentication helper for Vercel functions
 * @param req - Request object with cookies
 * @param res - Response object
 * @returns AuthenticatedUser if successful, sends error response and returns null if not
 */
export function requireAuthentication(req: any, res: any): AuthenticatedUser | null {
  const authResult = verifyAuthentication(req.cookies || {});
  
  if (!authResult.success) {
    res.status(401).json({ error: authResult.error || 'Not authenticated' });
    return null;
  }
  
  return authResult.user!;
}