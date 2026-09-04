const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'poker-tracker-dev-secret';

app.use(cors());
app.use(express.json());

const db = require('./db');
const calculateSettlements = require('./utils/settlements');

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// --- Auth middleware ---
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// --- Auth routes ---
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const result = stmt.run(email, passwordHash);
    res.json({ id: result.lastInsertRowid, email });
  } catch (err) {
    res.status(400).json({ error: 'Email already in use' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, email: user.email });
});

// --- Sessions ---
app.post('/api/sessions', requireAuth, (req, res) => {
  const { name } = req.body;
  const stmt = db.prepare('INSERT INTO sessions (user_id, name) VALUES (?, ?)');
  const result = stmt.run(req.userId, name);
  res.json({ id: result.lastInsertRowid, name });
});

app.get('/api/sessions', requireAuth, (req, res) => {
  const sessions = db.prepare('SELECT * FROM sessions WHERE user_id = ?').all(req.userId);
  res.json(sessions);
});

// --- Players ---
app.post('/api/sessions/:id/players', requireAuth, (req, res) => {
  const sessionId = req.params.id;
  const { name } = req.body;
  const stmt = db.prepare('INSERT INTO players (session_id, name) VALUES (?, ?)');
  const result = stmt.run(sessionId, name);
  res.json({ id: result.lastInsertRowid, sessionId, name });
});

app.get('/api/sessions/:id/players', requireAuth, (req, res) => {
  const sessionId = req.params.id;
  const players = db.prepare('SELECT * FROM players WHERE session_id = ?').all(sessionId);
  res.json(players);
});

// --- Buy-ins / Cash-outs ---
app.post('/api/players/:id/buyins', requireAuth, (req, res) => {
  const playerId = req.params.id;
  const { amount } = req.body;
  const stmt = db.prepare('INSERT INTO buy_ins (player_id, amount) VALUES (?, ?)');
  const result = stmt.run(playerId, amount);
  res.json({ id: result.lastInsertRowid, playerId, amount });
});

app.post('/api/players/:id/cashout', requireAuth, (req, res) => {
  const playerId = req.params.id;
  const { amount } = req.body;
  const stmt = db.prepare('INSERT INTO cash_outs (player_id, amount) VALUES (?, ?)');
  const result = stmt.run(playerId, amount);
  res.json({ id: result.lastInsertRowid, playerId, amount });
});

// --- Settle up ---
app.get('/api/sessions/:id/settle', requireAuth, (req, res) => {
  const sessionId = req.params.id;

  const players = db.prepare('SELECT * FROM players WHERE session_id = ?').all(sessionId);

  const playerBalances = players.map(player => {
    const buyInsResult = db.prepare('SELECT SUM(amount) as total FROM buy_ins WHERE player_id = ?').get(player.id);
    const cashOutResult = db.prepare('SELECT SUM(amount) as total FROM cash_outs WHERE player_id = ?').get(player.id);

    const totalBuyIns = buyInsResult.total || 0;
    const totalCashOut = cashOutResult.total || 0;
    const net = totalCashOut - totalBuyIns;

    return { name: player.name, net };
  });

  const transactions = calculateSettlements(playerBalances);
  res.json({ playerBalances, transactions });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});