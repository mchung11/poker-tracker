import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sessions, setSessions] = useState([])
  const [newSessionName, setNewSessionName] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  function fetchSessions() {
    fetch('http://localhost:3001/api/sessions')
      .then(res => res.json())
      .then(data => setSessions(data))
  }

  function handleCreateSession() {
    fetch('http://localhost:3001/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSessionName })
    })
      .then(res => res.json())
      .then(() => {
        setNewSessionName('')
        fetchSessions()
      })
  }

  return (
    <div>
      <h1>Poker Tracker</h1>

      <h2>Sessions</h2>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>{session.name}</li>
        ))}
      </ul>

      <h3>New Session</h3>
      <input
        type="text"
        value={newSessionName}
        onChange={(e) => setNewSessionName(e.target.value)}
        placeholder="Session name"
      />
      <button onClick={handleCreateSession}>Create Session</button>
    </div>
  )
}

export default App