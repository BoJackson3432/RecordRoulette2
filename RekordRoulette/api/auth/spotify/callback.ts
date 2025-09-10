import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect('/?error=access_denied');
    }

    if (!code || typeof code !== 'string') {
      return res.redirect('/?error=invalid_code');
    }

    // Verify state from cookie - require both to exist and match
    const storedState = req.cookies.oauth_state;
    if (!state || !storedState || typeof state !== 'string' || state !== storedState) {
      console.error('OAuth state validation failed - state:', !!state, 'stored:', !!storedState, 'match:', state === storedState);
      return res.redirect('/?error=invalid_state');
    }

    // Exchange code for tokens - simplified
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
    const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://www.recordroulette.com/api/auth/spotify/callback';
    
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    });

    // Exchange code for tokens with proper error handling
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`
      },
      body: params.toString()
    });
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenResponse.status);
      return res.redirect('/?error=token_exchange_failed');
    }
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      console.error('No access token in response:', tokens);
      return res.redirect('/?error=invalid_token_response');
    }
    
    // Get user info from Spotify with error handling
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    if (!userResponse.ok) {
      console.error('User info fetch failed:', userResponse.status);
      return res.redirect('/?error=user_fetch_failed');
    }
    
    const spotifyUser = await userResponse.json();
    
    if (!spotifyUser.id) {
      console.error('No user ID in Spotify response:', spotifyUser);
      return res.redirect('/?error=invalid_user_response');
    }
    
    // Create secure session with validation token
    const userInfo = {
      id: `spotify-${spotifyUser.id}`,
      name: spotifyUser.display_name || spotifyUser.id,
      email: spotifyUser.email
    };
    
    // Create cryptographically signed session token
    const sessionData = {
      userId: userInfo.id,
      email: spotifyUser.email,
      iat: Math.floor(Date.now() / 1000), // issued at (seconds)
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // expires in 7 days
    };
    
    const payload = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
    const secret = process.env.SESSION_SECRET;
    
    if (!secret) {
      console.error('SESSION_SECRET environment variable is required for production');
      return res.redirect('/?error=server_configuration_error');
    }
    
    const signature = createHmac('sha256', secret).update(payload).digest('base64url');
    const sessionToken = `${payload}.${signature}`;
    
    // Set secure session cookies
    res.setHeader('Set-Cookie', [
      `user_id=${userInfo.id}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`,
      `user_name=${encodeURIComponent(userInfo.name)}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`,
      `session_token=${sessionToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`,
      'oauth_state=; HttpOnly; Path=/; Max-Age=0; Secure'
    ]);
    
    res.redirect('/');
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}