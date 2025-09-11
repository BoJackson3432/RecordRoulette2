export default function handler(req, res) {
  // Example music discovery endpoint
  const sampleTracks = [
    { id: 1, title: "Example Track 1", artist: "Sample Artist", genre: "Rock" },
    { id: 2, title: "Example Track 2", artist: "Demo Band", genre: "Pop" },
    { id: 3, title: "Example Track 3", artist: "Test Artist", genre: "Jazz" }
  ]

  res.status(200).json({
    message: 'Music discovery endpoint',
    tracks: sampleTracks,
    total: sampleTracks.length,
    timestamp: new Date().toISOString()
  })
}