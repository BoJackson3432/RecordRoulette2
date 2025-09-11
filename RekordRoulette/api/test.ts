export default function handler(req: any, res: any) {
  res.status(200).json({ 
    message: "API Test Works!", 
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url 
  });
}