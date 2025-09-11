export default function handler(req: any, res: any) {
  // Simple user endpoint without authentication
  const mockUser = {
    id: 'demo-user-123',
    displayName: 'Demo User',
    email: 'demo@recordroulette.com',
    isPremium: false,
    spinsRemaining: 5
  };
  
  res.status(200).json(mockUser);
}