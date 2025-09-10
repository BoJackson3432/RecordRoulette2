import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Clear authentication cookies
    res.setHeader('Set-Cookie', [
      'user_id=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure',
      'user_name=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure'
    ]);
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
}