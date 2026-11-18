const mongoose = require('mongoose');
const { cacheTtlSec } = require('../config');

const cacheSchema = new mongoose.Schema({
  key: { type: String, unique: true, index: true },
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, expires: cacheTtlSec },
});

const searchSchema = new mongoose.Schema({
  q: { type: String, unique: true, index: true },
  count: { type: Number, default: 1 },
  lastAt: { type: Date, default: Date.now },
});

const downloadSchema = new mongoose.Schema({
  url: { type: String, unique: true, index: true },
  title: String,
  count: { type: Number, default: 1 },
  lastAt: { type: Date, default: Date.now },
});

module.exports = {
  Cache: mongoose.model('Cache', cacheSchema),
  Search: mongoose.model('Search', searchSchema),
  Download: mongoose.model('Download', downloadSchema),
};
