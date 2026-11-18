const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('./src/config');
const { connectDB } = require('./src/db');
const api = require('./src/routes/api');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use('/api', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));
app.use('/api', api);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

connectDB().finally(() => {
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
});
