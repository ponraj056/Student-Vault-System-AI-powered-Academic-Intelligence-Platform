/**
 * Cache Service
 * Fast in-memory + MongoDB dual-layer caching for AI queries
 */
const AiCache = require('../models/aiCache');

// In-memory layer (L1) — ultra-fast, lives in process memory
const memCache = new Map();
const MEM_TTL_MS = 5 * 60 * 1000; // 5 minutes in memory

/**
 * Build a consistent cache key from intent + params
 */
function buildKey(intent, params = {}) {
  const dept = (params.dept || 'all').toLowerCase();
  const sem  = params.semester || 'all';
  return `${intent}_${dept}_${sem}`.toUpperCase();
}

/**
 * Get from cache — checks memory first, then MongoDB
 */
async function getCache(intent, params) {
  const key = buildKey(intent, params);

  // L1: Check in-memory cache
  const mem = memCache.get(key);
  if (mem && Date.now() - mem.ts < MEM_TTL_MS) {
    console.log(`⚡ Cache HIT (memory): ${key}`);
    return { hit: true, data: mem.data, message: mem.message };
  }

  // L2: Check MongoDB cache
  try {
    const cached = await AiCache.findOne({ key });
    if (cached) {
      const ageSeconds = (Date.now() - new Date(cached.computedAt).getTime()) / 1000;
      if (ageSeconds < cached.ttl) {
        console.log(`✅ Cache HIT (MongoDB): ${key} — age: ${Math.round(ageSeconds)}s`);
        // Promote to memory cache
        memCache.set(key, { data: cached.data, message: cached.message, ts: Date.now() });
        return { hit: true, data: cached.data, message: cached.message };
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e.message);
  }

  return { hit: false };
}

/**
 * Set cache — stores in memory + MongoDB
 */
async function setCache(intent, params, data, message) {
  const key = buildKey(intent, params);

  // L1: Store in memory
  memCache.set(key, { data, message, ts: Date.now() });

  // L2: Upsert in MongoDB
  try {
    await AiCache.findOneAndUpdate(
      { key },
      { key, intent, dept: params.dept || 'all', params, data, message, computedAt: new Date() },
      { upsert: true, new: true }
    );
    console.log(`💾 Cache SET: ${key}`);
  } catch (e) {
    console.warn('Cache write error:', e.message);
  }
}

/**
 * Invalidate cache for a specific dept or all
 */
async function invalidateCache(dept) {
  // Clear memory cache
  for (const key of memCache.keys()) {
    if (!dept || key.includes((dept || '').toUpperCase())) {
      memCache.delete(key);
    }
  }

  // Clear MongoDB cache
  try {
    const query = dept ? { dept: dept.toLowerCase() } : {};
    const result = await AiCache.deleteMany(query);
    console.log(`🗑️  Cache invalidated: ${result.deletedCount} entries (dept: ${dept || 'all'})`);
  } catch (e) {
    console.warn('Cache invalidation error:', e.message);
  }
}

module.exports = { getCache, setCache, invalidateCache, buildKey };
