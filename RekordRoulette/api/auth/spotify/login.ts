export default function handler(req: any, res: any) {
  try {
    const state = Math.random().toString(36).substring(7);
    
    // Store state in cookie for verification
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);
    
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