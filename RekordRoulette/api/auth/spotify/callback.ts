import type { VercelRequest, VercelResponse } from '@vercel/node';
import { spotifyAuth } from '../../../server/auth/spotify';
import { storage } from '../../../server/storage';
import { createSession, setSessionCookie } from '../session';

// Helper function to create or update user
async function createOrUpdateUser(spotifyUser: any, tokens: any) {
  // Check if user exists
  const existingUser = await storage.getUserByProviderId(spotifyUser.id);
  
  const userData = {
    providerId: spotifyUser.id,
    displayName: spotifyUser.display_name || spotifyUser.id,
    email: spotifyUser.email,
    avatarUrl: spotifyUser.images?.[0]?.url || null,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpires: new Date(Date.now() + (tokens.expires_in - 60) * 1000),
  };

  if (existingUser) {
    return await storage.updateUser(existingUser.id, userData);
  } else {
    return await storage.createUser(userData);
  }
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
    const tokens = await spotifyAuth.exchangeCodeForTokens(code);
    
    // Get user info from Spotify
    const spotifyUser = await spotifyAuth.getSpotifyUser(tokens.access_token);
    
    // Create or update user in database
    const user = await createOrUpdateUser(spotifyUser, tokens);

    // Create session token
    const sessionToken = createSession(user.id);
    setSessionCookie(res, sessionToken);
    
    // Clear oauth state cookie
    res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Path=/; Max-Age=0');
    
    res.redirect('/');
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}