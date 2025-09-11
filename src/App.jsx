import { useState, useEffect } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('API Error'))
  }, [])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center' }}>
      <h1>🎵 RecordRoulette - Clean Start</h1>
      <p>Music Discovery Application</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px', 
        margin: '20px 0' 
      }}>
        <strong>API Status:</strong> {apiStatus}
      </div>
      <p>✅ Frontend Working</p>
      <p>✅ Clean Architecture</p>
      <p>✅ Ready for Development</p>
    </div>
  )
}

export default App