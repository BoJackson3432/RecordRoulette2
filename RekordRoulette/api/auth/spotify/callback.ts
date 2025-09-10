import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { createSession, setSessionCookie } from '../session';

const SPOTIFY_CONFIG = {
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
  TOKEN_URL: "https://accounts.spotify.com/api/token",
  API_BASE: "https://api.spotify.com/v1",
  REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI!,
};

async function exchangeCodeForTokens(code: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
  });

  const response = await axios.post(SPOTIFY_CONFIG.TOKEN_URL, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`).toString("base64")}`,
    },
  });

  return response.data;
}

async function getSpotifyUser(accessToken: string) {
  const response = await axios.get(`${SPOTIFY_CONFIG.API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

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

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // Get user info from Spotify
    const spotifyUser = await getSpotifyUser(tokens.access_token);
    
    // For now, create a mock user session until database is connected
    const mockUserId = `spotify-${spotifyUser.id}`;
    
    // Create session token
    const sessionToken = createSession(mockUserId);
    setSessionCookie(res, sessionToken);
    
    // Clear oauth state cookie
    res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Path=/; Max-Age=0');
    
    res.redirect('/');
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}