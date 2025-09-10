import type { VercelRequest, VercelResponse } from '@vercel/node';
import { spotifyAuth } from '../../../server/auth/spotify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const state = Math.random().toString(36).substring(7);
    
    // Store state in cookie for verification
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);
    
    const authUrl = spotifyAuth.getAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Spotify login error:', error);
    res.status(500).json({ error: 'Failed to initiate Spotify login' });
  }
}