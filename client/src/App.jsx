import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [sessions, setSessions] = useState([])
  const [newSessionName, setNewSessionName] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (token) {
      fetchSessions()
    }
  }, [token])

  function fetchSessions() {
    fetch(`${API_URL}/api/sessions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSessions(data))
  }

  function handleCreateSession() {
    fetch(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newSessionName })
    })
      .then(res => res.json())
      .then(() => {
        setNewSessionName('')
        fetchSessions()
      })
  }

  function handleSignup() {
    fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAuthError(data.error)
        } else {
          handleLogin()
        }
      })
  }

  function handleLogin() {
    fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAuthError(data.error)
        } else {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          setAuthError('')
        }
      })
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return (
      <div>
        <h1>Poker Tracker</h1>
        <h2>Log In or Sign Up</h2>
        {authError && <p style={{ color: 'red' }}>{authError}</p>}
        <input
          type="email"
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={authPassword}
          onChange={(e) => setAuthPassword(e.target.value)}
          placeholder="Password"
        />
        <div className="new-item-row">
          <button onClick={handleLogin}>Log In</button>
          <button onClick={handleSignup}>Sign Up</button>
        </div>
      </div>
    )
  }

  if (selectedSession) {
    return (
      <SessionDetail
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
        token={token}
      />
    )
  }

  return (
    <div>
      <h1>Poker Tracker</h1>

      <h2>Sessions</h2>
      <ul>
        {sessions.map(session => (
          <li key={session.id} className="session-list-item">
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

      <div style={{ marginTop: '40px' }}>
        <button className="back-button" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  )
}

function SessionDetail({ session, onBack, token }) {
  const [players, setPlayers] = useState([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [settleResult, setSettleResult] = useState(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  function fetchPlayers() {
    fetch(`${API_URL}/api/sessions/${session.id}/players`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPlayers(data))
  }

  function handleAddPlayer() {
    fetch(`${API_URL}/api/sessions/${session.id}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newPlayerName })
    })
      .then(res => res.json())
      .then(() => {
        setNewPlayerName('')
        fetchPlayers()
      })
  }

  function handleBuyIn(playerId, amount) {
    fetch(`${API_URL}/api/players/${playerId}/buyins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: Number(amount) })
    }).then(() => alert('Buy-in logged'))
  }

  function handleCashOut(playerId, amount) {
    fetch(`${API_URL}/api/players/${playerId}/cashout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: Number(amount) })
    }).then(() => alert('Cash-out logged'))
  }

  function handleSettle() {
    fetch(`${API_URL}/api/sessions/${session.id}/settle`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSettleResult(data))
  }

  return (
    <div>
      <button className="back-button" onClick={onBack}>← Back to Sessions</button>
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
        <div className="transactions">
          <h4>Transactions:</h4>
          <ul>
            {settleResult.transactions.map((t, i) => (
              <li key={i} className="transaction-item">{t.from} pays {t.to} ${t.amount}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

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