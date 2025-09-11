export default function handler(req: any, res: any) {
  res.status(200).json({ 
    status: "healthy",
    service: "RecordRoulette API",
    timestamp: new Date().toISOString()
  });
}