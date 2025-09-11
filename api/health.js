export default function handler(req, res) {
  res.status(200).json({
    status: 'API Working',
    timestamp: new Date().toISOString(),
    method: req.method
  })
}