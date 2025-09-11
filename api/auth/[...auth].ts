import { requireAuthentication } from '../../RekordRoulette/shared/auth';

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
          return res.redirect('/?error=auth_failed');
        }
        
        if (code) {
          // For demo: create a mock session with proper authentication
          const mockUser = {
            id: `user_${Date.now()}`,
            displayName: 'Demo User',
            email: 'demo@recordroulette.com',
            spotifyId: 'demo_spotify_user'
          };
          
          // Set session cookie (simplified for demo)
          const sessionData = JSON.stringify(mockUser);
          res.setHeader('Set-Cookie', `session=${Buffer.from(sessionData).toString('base64')}; Path=/; HttpOnly; SameSite=Strict`);
          res.redirect('/?auth=success');
        } else {
          res.redirect('/?error=no_code');
        }
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