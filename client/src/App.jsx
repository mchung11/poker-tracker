import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sessions, setSessions] = useState([])
  const [newSessionName, setNewSessionName] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)

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

  // If a session is selected, show the detail view instead of the list
  if (selectedSession) {
    return (
      <SessionDetail
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
      />
    )
  }

  // Otherwise, show the session list (same as before)
  return (
    <div>
      <h1>Poker Tracker</h1>

      <h2>Sessions</h2>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>
            <button onClick={() => setSelectedSession(session)}>
              {session.name}
            </button>
          </li>
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

// A separate component for the session detail screen
function SessionDetail({ session, onBack }) {
  const [players, setPlayers] = useState([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [settleResult, setSettleResult] = useState(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  function fetchPlayers() {
    // We don't have a "get players for session" route yet -- we'll add it
    fetch(`http://localhost:3001/api/sessions/${session.id}/players`)
      .then(res => res.json())
      .then(data => setPlayers(data))
  }

  function handleAddPlayer() {
    fetch(`http://localhost:3001/api/sessions/${session.id}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlayerName })
    })
      .then(res => res.json())
      .then(() => {
        setNewPlayerName('')
        fetchPlayers()
      })
  }

  function handleBuyIn(playerId, amount) {
    fetch(`http://localhost:3001/api/players/${playerId}/buyins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) })
    }).then(() => alert('Buy-in logged'))
  }

  function handleCashOut(playerId, amount) {
    fetch(`http://localhost:3001/api/players/${playerId}/cashout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) })
    }).then(() => alert('Cash-out logged'))
  }

  function handleSettle() {
    fetch(`http://localhost:3001/api/sessions/${session.id}/settle`)
      .then(res => res.json())
      .then(data => setSettleResult(data))
  }

  return (
    <div>
      <button onClick={onBack}>← Back to Sessions</button>
      <h1>{session.name}</h1>

      <h2>Players</h2>
      <ul>
        {players.map(player => (
          <PlayerRow
            key={player.id}
            player={player}
            onBuyIn={handleBuyIn}
            onCashOut={handleCashOut}
          />
        ))}
      </ul>

      <h3>Add Player</h3>
      <input
        type="text"
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
        placeholder="Player name"
      />
      <button onClick={handleAddPlayer}>Add Player</button>

      <h3>Settle Up</h3>
      <button onClick={handleSettle}>Calculate Settlement</button>
      {settleResult && (
        <div>
          <h4>Transactions:</h4>
          <ul>
            {settleResult.transactions.map((t, i) => (
              <li key={i}>{t.from} pays {t.to} ${t.amount}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// A small component for one player's row -- has its own input state for amounts
function PlayerRow({ player, onBuyIn, onCashOut }) {
  const [buyInAmount, setBuyInAmount] = useState('')
  const [cashOutAmount, setCashOutAmount] = useState('')

  return (
    <li>
      {player.name}
      {' '}
      <input
        type="number"
        value={buyInAmount}
        onChange={(e) => setBuyInAmount(e.target.value)}
        placeholder="Buy-in"
        style={{ width: '60px' }}
      />
      <button onClick={() => onBuyIn(player.id, buyInAmount)}>Log Buy-in</button>
      {' '}
      <input
        type="number"
        value={cashOutAmount}
        onChange={(e) => setCashOutAmount(e.target.value)}
        placeholder="Cash-out"
        style={{ width: '60px' }}
      />
      <button onClick={() => onCashOut(player.id, cashOutAmount)}>Log Cash-out</button>
    </li>
  )
}

export default App