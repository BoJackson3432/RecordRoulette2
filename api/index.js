export default function handler(req, res) {
  res.status(200).json({
    message: 'RecordRoulette API',
    version: '2.0.0',
    status: 'running',
    endpoints: [
      '/api/health',
      '/api/index'
    ]
  })
}