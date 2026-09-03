import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/sessions')
      .then(res => res.json())
      .then(data => setSessions(data))
  }, [])

  return (
    <div>
      <h1>Poker Tracker</h1>
      <h2>Sessions</h2>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>{session.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App