export default function handler(req: any, res: any) {
  // Simple Spotify login redirect
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI || 'https://recordroulette-fresh.vercel.app/api/auth/spotify/callback')}&scope=user-read-private user-read-email user-library-read`;
  
  res.redirect(spotifyAuthUrl);
}