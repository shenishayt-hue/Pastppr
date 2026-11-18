const router = require('express').Router();
const { SOURCES, search, details } = require('../services/supun');
const { isReady } = require('../db');
const { Search, Download } = require('../models');

const getSource = (req) => (SOURCES[req.query.source] ? req.query.source : 'wiki');
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e.message);
    res.status(502).json({ success: false, error: 'Could not reach paper service. Try again.' });
  });

router.get('/search', wrap(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  if (q.length < 2) return res.status(400).json({ success: false, error: 'Enter at least 2 characters.' });
  const results = await search(getSource(req), q);
  if (isReady()) {
    Search.updateOne({ q: q.toLowerCase() }, { $inc: { count: 1 }, $set: { lastAt: new Date() } }, { upsert: true }).catch(() => {});
  }
  res.json({ success: true, query: q, count: results.length, results });
}));

router.get('/details', wrap(async (req, res) => {
  const url = String(req.query.url || '');
  if (!/^https?:\/\//i.test(url)) return res.status(400).json({ success: false, error: 'Invalid url.' });
  const data = await details(getSource(req), url);
  res.json({ success: true, ...data });
}));

router.post('/track', (req, res) => {
  const { url, title } = req.body || {};
  if (isReady() && typeof url === 'string') {
    Download.updateOne({ url }, { $inc: { count: 1 }, $set: { title: String(title || '').slice(0, 200), lastAt: new Date() } }, { upsert: true }).catch(() => {});
  }
  res.json({ success: true });
});

router.get('/popular', async (_req, res) => {
  if (!isReady()) return res.json({ success: true, results: [] });
  const rows = await Search.find().sort({ count: -1 }).limit(8).lean();
  res.json({ success: true, results: rows.map((r) => r.q) });
});

module.exports = router;
