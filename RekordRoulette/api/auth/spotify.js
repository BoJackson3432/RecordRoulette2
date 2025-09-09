// Vercel serverless function for Spotify auth
import { stringify } from 'querystring';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Handle login - redirect to Spotify
    const scope = 'user-read-private user-read-email user-library-read user-top-read user-read-recently-played playlist-read-private';
    const state = Math.random().toString(36).substring(7);
    
    // Store state in cookie for verification
    res.setHeader('Set-Cookie', `spotify_auth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
    
    const authURL = 'https://accounts.spotify.com/authorize?' + stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    });

    res.redirect(authURL);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}