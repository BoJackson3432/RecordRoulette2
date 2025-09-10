import { requireAuthentication } from '../../shared/auth';

export default function handler(req: any, res: any) {
  try {
    const user = requireAuthentication(req, res);
    if (!user) return;

    // Stub can-spin check - always allow spinning for demo
    const canSpinData = {
      canSpin: true,
      spinsRemaining: 5,
      nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isPremium: false
    };

    res.status(200).json(canSpinData);
  } catch (error) {
    console.error('API /spin/can-spin error:', error);
    res.status(500).json({ error: 'Failed to check spin status' });
  }
}