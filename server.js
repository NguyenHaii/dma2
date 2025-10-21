const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const USERS = [
  { username: 'admin', password: '1' },
];

const ACCESS_TOKEN_SECRET = 'access-secret';
const REFRESH_TOKEN_SECRET = 'refresh-secret';

let refreshTokens = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = jwt.sign({ username }, ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
  const refreshToken = jwt.sign({ username }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

app.post('/api/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ username: payload.username }, ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
    res.json({ accessToken });
  } catch {
    res.sendStatus(403);
  }
});

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected content' });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
