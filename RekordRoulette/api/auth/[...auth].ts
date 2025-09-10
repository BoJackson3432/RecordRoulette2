import { requireAuthentication } from '../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const { auth } = req.query;
    const route = auth.join('/');

    switch (route) {
      case 'spotify/login':
        // Redirect to Spotify OAuth
        const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI || 'https://www.recordroulette.com/api/auth/spotify/callback')}&scope=user-read-private user-read-email user-library-read user-read-playback-state user-modify-playback-state`;
        res.redirect(spotifyAuthUrl);
        break;

      case 'spotify/callback':
        // Handle Spotify OAuth callback
        const { code, error } = req.query;
        if (error) {
          return res.status(400).json({ error: 'Spotify authorization failed' });
        }
        
        // In production, exchange code for tokens and create session
        // For demo, just redirect to success
        res.redirect('/?auth=success');
        break;

      case 'logout':
        // Clear session
        res.clearCookie('session');
        res.status(200).json({ success: true });
        break;

      default:
        res.status(404).json({ error: 'Auth route not found' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}