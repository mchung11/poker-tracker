const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

const db = require('./db');

app.post('/api/sessions', (req, res) => {
  const { name } = req.body;
  const stmt = db.prepare('INSERT INTO sessions (name) VALUES (?)');
  const result = stmt.run(name);
  res.json({ id: result.lastInsertRowid, name });
});

app.post('/api/sessions/:id/players', (req, res) => {
  const sessionId = req.params.id;
  const { name } = req.body;
  const stmt = db.prepare('INSERT INTO players (session_id, name) VALUES (?, ?)');
  const result = stmt.run(sessionId, name);
  res.json({ id: result.lastInsertRowid, sessionId, name });
});

app.post('/api/players/:id/buyins', (req, res) => {
  const playerId = req.params.id;
  const { amount } = req.body;
  const stmt = db.prepare('INSERT INTO buy_ins (player_id, amount) VALUES (?, ?)');
  const result = stmt.run(playerId, amount);
  res.json({ id: result.lastInsertRowid, playerId, amount });
});

app.post('/api/players/:id/cashout', (req, res) => {
  const playerId = req.params.id;
  const { amount } = req.body;
  const stmt = db.prepare('INSERT INTO cash_outs (player_id, amount) VALUES (?, ?)');
  const result = stmt.run(playerId, amount);
  res.json({ id: result.lastInsertRowid, playerId, amount });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});