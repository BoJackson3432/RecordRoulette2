import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect('/?error=access_denied');
    }

    if (!code || typeof code !== 'string') {
      return res.redirect('/?error=invalid_code');
    }

    // Verify state from cookie
    const storedState = req.cookies.oauth_state;
    if (state !== storedState) {
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

    // Use fetch instead of axios
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`
      },
      body: params.toString()
    });
    
    const tokens = await tokenResponse.json();
    
    // Get user info from Spotify
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const spotifyUser = await userResponse.json();
    
    // Create simple session - no JWT for now
    const userInfo = {
      id: `spotify-${spotifyUser.id}`,
      name: spotifyUser.display_name || spotifyUser.id,
      email: spotifyUser.email
    };
    
    // Set secure session cookies
    res.setHeader('Set-Cookie', [
      `user_id=${userInfo.id}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`,
      `user_name=${encodeURIComponent(userInfo.name)}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax; Secure`,
      'oauth_state=; HttpOnly; Path=/; Max-Age=0; Secure'
    ]);
    
    res.redirect('/');
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}