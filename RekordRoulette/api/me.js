// Vercel serverless function for user profile
import { getDatabase } from '../lib/supabase.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

function getUserFromSession(req) {
  try {
    const sessionCookie = req.headers.cookie
      ?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];
    
    if (!sessionCookie) return null;
    
    const session = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
    return session.userId;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserFromSession(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const db = getDatabase();
    const [user] = await db.select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      premiumTier: users.premiumTier,
      onboardingCompleted: users.onboardingCompleted,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}