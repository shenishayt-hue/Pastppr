require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  apiBase: process.env.SUPUN_BASE_URL || 'https://supunofc.site',
  apiKey: process.env.SUPUN_API_KEY,
  cacheTtlSec: Number(process.env.CACHE_TTL_HOURS || 6) * 3600,
};
