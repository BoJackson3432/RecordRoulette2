import { randomBytes } from 'crypto';

export default function handler(req: any, res: any) {
  try {
    const state = randomBytes(16).toString('base64url');
    
    // Store state in cookie for verification
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`);
    
    // Build Spotify auth URL
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
    const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://www.recordroulette.com/api/auth/spotify/callback';
    const SCOPES = "user-read-email user-library-read user-read-recently-played user-top-read user-read-playback-state user-modify-playback-state streaming";
    
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPES,
      redirect_uri: REDIRECT_URI,
      state,
    });
    
    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    res.redirect(authUrl);
  } catch (error) {
    console.error('Spotify login error:', error);
    res.status(500).json({ error: 'Failed to initiate Spotify login' });
  }
}