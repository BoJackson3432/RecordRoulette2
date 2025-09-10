import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple Spotify auth configuration for serverless
const SPOTIFY_CONFIG = {
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
  AUTH_URL: "https://accounts.spotify.com/authorize",
  SCOPES: "user-read-email user-library-read user-read-recently-played user-top-read user-read-playback-state user-modify-playback-state streaming",
  REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI!,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const state = Math.random().toString(36).substring(7);
    
    // Store state in cookie for verification
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`);
    
    // Build Spotify auth URL
    const params = new URLSearchParams({
      response_type: "code",
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      scope: SPOTIFY_CONFIG.SCOPES,
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      state,
    });
    
    const authUrl = `${SPOTIFY_CONFIG.AUTH_URL}?${params.toString()}`;
    res.redirect(authUrl);
  } catch (error) {
    console.error('Spotify login error:', error);
    res.status(500).json({ error: 'Failed to initiate Spotify login' });
  }
}