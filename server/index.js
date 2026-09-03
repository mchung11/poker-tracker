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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});