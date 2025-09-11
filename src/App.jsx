import { useState, useEffect } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState('Ready for Production')
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Only test API in production environment
    if (import.meta.env.PROD) {
      setIsProduction(true)
      fetch('/api/health')
        .then(res => res.json())
        .then(data => setApiStatus(data.status))
        .catch(() => setApiStatus('API Error'))
    } else {
      setApiStatus('Development Mode - Skipped')
    }
  }, [])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center' }}>
      <h1>🎵 RecordRoulette - Clean Foundation</h1>
      <p>Music Discovery Application</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px', 
        margin: '20px 0' 
      }}>
        <strong>Environment:</strong> {isProduction ? 'Production' : 'Development'}<br/>
        <strong>API Status:</strong> {apiStatus}
      </div>
      <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
        <h3>✅ Clean Architecture Features:</h3>
        <ul>
          <li><strong>Single API Location:</strong> All functions in <code>/api</code></li>
          <li><strong>Proper Routing:</strong> SPA rewrites work correctly</li>
          <li><strong>Dev/Prod Aware:</strong> No API calls during development</li>
          <li><strong>Vercel Ready:</strong> Optimized deployment configuration</li>
          <li><strong>Systematic Foundation:</strong> No accumulated complexity</li>
        </ul>
        <h3>🚀 Deployment Ready:</h3>
        <p>Deploy to Vercel with Root Directory = <strong>empty</strong> (repository root)</p>
      </div>
    </div>
  )
}

export default App