import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const user = {
    id: 'demo-user',
    displayName: 'Demo User',
    email: 'demo@recordroulette.com',
    isPremium: false,
    spinsRemaining: 5
  };

  res.status(200).json(user);
}