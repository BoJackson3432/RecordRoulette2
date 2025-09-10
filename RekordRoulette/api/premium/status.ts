import { requireAuthentication } from '../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    // Stub premium status for immediate deployment
    const premiumStatus = {
      isPremium: false,
      tier: 'free',
      isUnlimited: false,
      dailySpinLimit: 5,
      usage: {
        monthlySpins: 12,
        dailyAverage: 2.4,
        standardLimitExceeded: false
      }
    };

    res.status(200).json(premiumStatus);
  } catch (error) {
    console.error('API /premium/status error:', error);
    res.status(500).json({ error: 'Failed to get premium status' });
  }
}