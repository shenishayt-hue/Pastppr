const { apiBase, apiKey } = require('../config');
const { isReady } = require('../db');
const { Cache } = require('../models');

const SOURCES = {
  wiki: {
    search: '/api/pastpapers/pastpapers/search',
    detail: '/api/pastpapers/pastpapers/dl',
  },
  lk: {
    search: '/api/pastpapers/pastpapers-lk/search',
    detail: '/api/pastpapers/pastpapers-lk/details',
  },
};

async function request(path, params) {
  const url = new URL(apiBase + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('apikey', apiKey);
  const res = await fetch(url, { signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`Upstream error ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error('Upstream request failed');
  return json;
}

async function cached(key, loader) {
  if (isReady()) {
    const hit = await Cache.findOne({ key }).lean().catch(() => null);
    if (hit) return hit.data;
  }
  const data = await loader();
  if (isReady()) {
    Cache.updateOne({ key }, { key, data, createdAt: new Date() }, { upsert: true }).catch(() => {});
  }
  return data;
}

const isHomepage = (link) => {
  try { return new URL(link).pathname.replace(/\//g, '') === ''; } catch { return true; }
};

async function search(source, q) {
  const cfg = SOURCES[source];
  return cached(`s:${source}:${q.toLowerCase()}`, async () => {
    const json = await request(cfg.search, { q });
    const seen = new Set();
    return (json.results || [])
      .filter((r) => r.link && !isHomepage(r.link) && !seen.has(r.link) && seen.add(r.link))
      .map((r) => ({ title: r.title, link: r.link, thumbnail: r.thumbnail || null }));
  });
}

async function details(source, url) {
  const cfg = SOURCES[source];
  return cached(`d:${source}:${url}`, async () => {
    const { results = {} } = await request(cfg.detail, { url });
    return {
      title: results.title || '',
      thumbnail: results.thumbnail || null,
      description: results.shortDescription || '',
      pdfLinks: results.pdfLinks || [],
    };
  });
}

module.exports = { SOURCES, search, details };
