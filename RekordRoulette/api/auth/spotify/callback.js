// Vercel serverless function for Spotify auth callback
import { getDatabase } from '../../../lib/supabase.js';
import { users } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error } = req.query;

  if (error) {
    return res.redirect('/?error=access_denied');
  }

  if (!code || !state) {
    return res.redirect('/?error=invalid_request');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return res.redirect('/?error=token_exchange_failed');
    }

    // Get user profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const profile = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', profile);
      return res.redirect('/?error=profile_fetch_failed');
    }

    // Store user in database
    const db = getDatabase();
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const [user] = await db.insert(users).values({
      provider: 'spotify',
      providerId: profile.id,
      displayName: profile.display_name,
      email: profile.email,
      avatarUrl: profile.images?.[0]?.url,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpires: expiresAt
    }).onConflictDoUpdate({
      target: users.providerId,
      set: {
        displayName: profile.display_name,
        email: profile.email,
        avatarUrl: profile.images?.[0]?.url,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpires: expiresAt
      }
    }).returning();

    // Set session cookie
    const sessionToken = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
    res.setHeader('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`); // 30 days

    res.redirect('/');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect('/?error=server_error');
  }
}