# PastPaper Hub

Express + MongoDB past paper search/download site.

## Run locally
    npm install
    npm start

## Deploy on Render
1. Push to GitHub (`.env` is git-ignored).
2. Render > New > Web Service > connect repo.
3. Build: `npm install` | Start: `npm start`
4. Add env vars: `SUPUN_API_KEY`, `SUPUN_BASE_URL`, `MONGODB_URI`, `CACHE_TTL_HOURS`.
5. MongoDB Atlas > Network Access > allow `0.0.0.0/0`.

## Structure
- `server.js` entry
- `src/config.js, db.js` setup
- `src/models` cache, search & download stats
- `src/services/supun.js` API client + caching
- `src/routes/api.js` /api/search, /details, /popular, /track
- `public/` frontend
